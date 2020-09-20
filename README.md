# Swagger-UI for Svelte

![npm](https://img.shields.io/npm/v/swagger-ui-svelte) ![npm](https://img.shields.io/npm/dm/swagger-ui-svelte) ![GitHub Workflow Status](https://img.shields.io/github/workflow/status/matchid-project/swagger-ui-svelte/Node.js%20Package)

Light version of swagger UI using Svelte JavaScript framework.

## Installation

```
npm i swagger-ui-svelte
// OR
yarn add swagger-ui-svelte
```

<em>Note: to use this library in sapper, install as devDependency. See the [link](https://github.com/sveltejs/sapper-template#using-external-components).</em>

## Demo [Link](https://matchid.io/swagger-ui-svelte)

Local demo:

```
git clone https://github.com/matchid-project/swagger-ui-svelte
cd swagger-ui-svelte
npm install && npm run dev
```

## Examples

An example of how to use the library

```js
<script>
  import SwaggerUISvelte from "swagger-ui-svelte";
</script>

<SwaggerUISvelte swagger_url="/swagger.json" />
```

## Properties

Component props:

| Prop            | Type   | Default              | Description               |
| --------------- | ------ | -------              | ------------------------- |
| `swagger_url`   | string | swagger-example.json | URL for swagger.json file |
