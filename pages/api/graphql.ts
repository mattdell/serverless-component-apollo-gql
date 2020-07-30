// pages/api/graphql.js
import { ApolloServer, gql } from "apollo-server-micro";

const typeDefs = gql`
  type Query {
    sayHello(name: String): String
  }
`;

const resolvers = {
  Query: {
    sayHello(parent: any, args: any, context: any) {
      return `Hello ${args.name}`;
    }
  }
};

export const config = {
  api: {
    bodyParser: false
  }
};

const apolloServer = new ApolloServer({ typeDefs, resolvers });
export default apolloServer.createHandler({ path: "/api/graphql" });
