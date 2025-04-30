import express from 'express';
import path from 'node:path';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { json } from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

import db from './config/connection.js';
import { typeDefs } from './schemas/typeDefs';
import { resolvers } from './schemas/resolvers';
import { getUserFromToken } from './services/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

//Here is the Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

async function StartApolloServer() {
  await server.start();

  app.use(cors());
  app.use(json());

  //Apollo middleware with authentication context
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => {
        const authHeader = req.headers.authorization || '';
        const user = getUserFromToken(authHeader);
        return { user };
      },
    })
  );

  // if we're in production, serve client/build as static assets
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }

  //Connect to DB and start server
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`🌍 Now listening on localhost:${PORT}`);
      console.log(`🚀 GraphQL endpoint at http://localhost:${PORT}/graphql`);
    });
  });
}


