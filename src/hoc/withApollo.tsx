import React, { useMemo } from "react";
import fetch from "isomorphic-unfetch";
import { NextComponentType, NextPageContext } from "next";
import { createPersistedQueryLink } from "apollo-link-persisted-queries";
import { onError } from "apollo-link-error";
import { ApolloProvider } from "react-apollo";
import { ApolloClient } from "apollo-client";
import {
  InMemoryCache,
  NormalizedCacheObject,
  defaultDataIdFromObject
} from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";

export type Maybe<T> = T | undefined;

const isServer = typeof window === "undefined";

import { fetch as apolloFetch, RequestInit, Request } from "apollo-server-env";

const fetchApollo = (
  input?: string | Request | undefined,
  init?: RequestInit | undefined
) =>
  apolloFetch(input, {
    timeout:
      typeof input === "object" && input.method === "POST" ? undefined : 2000,
    ...init
  });

// example taken from https://github.com/zeit/next.js/tree/canary/examples/with-apollo
let apolloClientGlobal: Maybe<ApolloClient<NormalizedCacheObject>>;
const nonLocalHost = isServer
  ? `https://${process.env.SUBDOMAIN}.${process.env.DOMAIN}`
  : ""; // use relative if we are on client
const serverHost = process.env.IS_LOCAL
  ? "http://localhost:3000"
  : nonLocalHost;
const serverUrl = `${serverHost}/api/graphql`;

const createApolloClient = (initialState = {}, cookie = "") => {
  const cache = new InMemoryCache({
    dataIdFromObject: (object: any) => {
      switch (
        object.__typename // eslint-disable-line no-underscore-dangle
      ) {
        case "Advert":
          return object.isFeatured
            ? `FeaturedAdvert:${object.id}`
            : `Advert:${object.id}`;
        case "NewsArticleCard":
          return object.isFeatured
            ? `FeaturedNewsArticleCard:${object.id}`
            : `NewsArticleCard:${object.id}`;
        default:
          return defaultDataIdFromObject(object); // fall back to default handling
      }
    }
  }).restore(initialState);

  const link = new HttpLink({
    uri: serverUrl,
    credentials: "omit",
    headers: {
      Cookie: cookie
    },
    fetch: (isServer ? fetchApollo : fetch) as any
  });

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) =>
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        )
      );
    }

    if (networkError) {
      console.error(`[Network error]: ${networkError}`);
    }
  });

  const persistedLink = createPersistedQueryLink({
    useGETForHashedQueries: true
  })
    .concat(errorLink)
    .concat(link);

  return new ApolloClient({
    ssrMode: isServer,
    link: persistedLink,
    defaultOptions: {
      query: {
        errorPolicy: "all"
      }
    },
    connectToDevTools: process.env.NODE_ENV !== "production",
    cache
  });
};

const initApolloClient = (initialState?: {}, cookie = "") => {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (isServer) {
    return createApolloClient(initialState, cookie);
  }

  // Reuse client on the client-side
  if (!apolloClientGlobal) {
    apolloClientGlobal = createApolloClient(initialState);
  }

  return apolloClientGlobal;
};

interface WithApolloProps {
  readonly apolloClient: ApolloClient<NormalizedCacheObject>;
  readonly apolloState: any;
}

export interface NextContextWithApollo {
  apolloClient: ApolloClient<NormalizedCacheObject>;
}

export const withApollo = <P extends object>(
  PageComponent: NextComponentType<NextPageContext, any, P>
) => ({ ssr = true } = {}) => {
  const WithApollo: NextComponentType<
    NextPageContext & NextContextWithApollo,
    any,
    P & WithApolloProps
  > = ({ apolloClient, apolloState, ...pageProps }) => {
    const client = useMemo(
      () => apolloClient || initApolloClient(apolloState),
      []
    );

    return (
      <ApolloProvider client={client}>
        <PageComponent {...(pageProps as P)} />
      </ApolloProvider>
    );
  };

  if (ssr || PageComponent.getInitialProps) {
    WithApollo.getInitialProps = async ctx => {
      // Initialize ApolloClient, add it to the ctx object so
      // we can use it in `PageComponent.getInitialProp`.
      const apolloClient = initApolloClient(undefined, ctx.req?.headers.cookie);
      ctx.apolloClient = apolloClient;

      // Run wrapped getInitialProps methods
      let pageProps = {};
      if (PageComponent.getInitialProps) {
        pageProps = await PageComponent.getInitialProps(ctx);
      }

      // Only on the server:
      if (isServer) {
        // When redirecting, the response is finished.
        // No point in continuing to render
        if (ctx.res && ctx.res.finished) {
          return pageProps;
        }
      }

      // Extract query data from the Apollo store
      const apolloState = apolloClient.cache.extract();

      return {
        ...pageProps,
        apolloState
      };
    };
  }

  return WithApollo;
};
