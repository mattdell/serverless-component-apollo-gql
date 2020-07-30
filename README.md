# Serverless Component + Apollo + GraphQL problem reproduction

## Getting started

Install dependencies

```
yarn
```

Apologies for there being so many dependencies. I took these from the current package.json I have and it would have taken hours to strip them down.

Start

```
yarn start
```

Go to http://localhost:3000/hello

You should see the text

```
Result: {"sayHello":"Hello John Doe"}
```

If you inspect the XHR requests in the browser you will see the response text is

```
{"errors":[{"message":"PersistedQueryNotFound","extensions":{"code":"PERSISTED_QUERY_NOT_FOUND","exception":{"stacktrace":["PersistedQueryNotFoundError: PersistedQueryNotFound","    at Object.<anonymous> (/Users/mdell/Work/Repos/next-component-apollo/node_modules/apollo-server-core/dist/requestPipeline.js:66:52)","    at Generator.next (<anonymous>)","    at fulfilled (/Users/mdell/Work/Repos/next-component-apollo/node_modules/apollo-server-core/dist/requestPipeline.js:5:58)"]}}}]}

```

This is fine. This is just how persisted queries work. The next XHR request is the correct response

```
{"data":{"sayHello":"Hello John Doe"}}
```

Deploy

```
env DOMAIN={your domain} SUBDOMAIN={your subdomain} npx serverless
```

Go to https://{your subdomain}.{your domain}/hello

You should see the text

```
Result:
```

If you inspect the XHR requests in the browser you will see the response text is

```
H4sIAAAAAAAAA6tWSi0qyi8qVrKKrlbKTS0uTkxPVbJSCkgtKs4sLklNCSxNLar0yy9xyy/NS1HSUUqtKEnNK87MzwPqqFZKzk8Bq3YNCvYMDnF1iQ8MdQ2KjPfzD4l38w/1c1GqrY2t5QIA0Ck+i2QAAAA=
```
