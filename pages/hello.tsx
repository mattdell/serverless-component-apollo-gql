import React from "react";
import gql from "graphql-tag";
import { ApolloClient } from "apollo-client";
import { NormalizedCacheObject } from "apollo-cache-inmemory/lib/types";
import { useQuery } from "react-apollo";
import { withApollo } from "../src/hoc/withApollo";

const NotFoundPage: React.FunctionComponent = () => {
  let data = undefined;

  ({ data } = useQuery(
    gql`
      {
        sayHello(name: "John Doe")
      }
    `,
    {
      ssr: false
    }
  ));

  return <div>Result: {JSON.stringify(data)}</div>;
};

export default withApollo(NotFoundPage)();
