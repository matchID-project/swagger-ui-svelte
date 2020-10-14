<script context="module">
	export function getCwd() {
    return require("path").resolve(__dirname, '../public')
	}
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  // compatibility issues when importing module
  // import type { OpenAPIV3 } from "openapi-types";
  // let swagger: OpenAPIV3.Document = null;
  import { compile } from "path-to-regexp";

  export let swaggerUrl = 'swagger-example.json';

  let swagger = null;
  let baseurl = '';
  let active = {};
  let responses = {};
  let requestParams = {}
  let requestBodyExample = {}
  let paths = {};

  const loadSwagger = async (swaggerUrl) => {
    const res = await fetch(swaggerUrl)
    swagger = await res.json()
    baseurl = swagger.servers[0].url

    Object.entries(swagger.paths).forEach((route, routeIdx) => {
     const category =  Object.values(route[1])[0].tags[0];
     Object.entries(route[1]).map((method, methodIdx) => {
       const id = `${routeIdx}-${methodIdx}`
       if (method[1].requestBody) {
         Object.entries(method[1].requestBody.content).forEach((item, fiel) => {
           if ('$ref' in item[1].schema) {
             requestBodyExample[id] = JSON.stringify(getSchema(item[1].schema['$ref']).example, null, 2)
           }
         })
       }
       if (category in paths) {
         paths[category].push({
           id,
           route: route[0],
           method: method[0],
           ...method[1]
        });
       } else {
         paths[category] = [{
           id,
           route: route[0],
           method: method[0],
           ...method[1]
        }];
       }
     })
    })
  }

  const getSchema = (refName) => {
    const division = refName.replace("#/", "").split("/")
    return swagger[division[0]][division[1]][division[2]]
  }

  const handleRequest = async (route, method, methodId, paramDetails) => {
    const reqParams = Object.entries(requestParams).filter(x => x[0].indexOf(methodId) > -1)
    const params = {}
    if (reqParams.length > 0) {
      reqParams.forEach(x => {
        const paramName = `${x[0].split("-")[2]}`
        const paramIn = paramDetails.find(param => param.name === paramName).in
        if (paramIn == 'query')  {
          params[paramName] = x[1]
        }
      })
    }
    const headers = { 'Content-Type': 'application/json' }
    const inPath = {}
    paramDetails.forEach(x => {
      if (x.in === 'path') {
        if ( reqParams.length > 0 && reqParams.find(param => param[0] === `${methodId}-${x.name}`)[1] ) {
          inPath[x.name] = reqParams.find(param => param[0] === `${methodId}-${x.name}`)[1] // paramDetails.indexOf(param => param.name === x.name)params[x.name]
        } else {
          inPath[x.name] = null
        }
      }
      if (x.in === 'header') {
        if ( reqParams.length > 0 && reqParams.find(param => param[0] === `${methodId}-${x.name}`)[1] ) {
          headers[x.name] = reqParams.find(param => param[0] === `${methodId}-${x.name}`)[1]
        }
      }
    })
    const toPath = compile(route, { encode: encodeURIComponent });
    const encodedUri = toPath(inPath)
    const queryString = Object.keys(params).map(key => key + '=' + params[key]).join('&');
    const url = `${baseurl}${encodedUri}${queryString ? `?${queryString}` : ''}`
    const response = await fetch(url, {
      method: method.toUpperCase(), // *GET, POST, PUT, DELETE, etc.
      // mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: headers,
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: requestBodyExample[methodId] // JSON.stringify(data) // body data type must match "Content-Type" header
    });
    responses[methodId] = response
    //response.json(); // parses JSON response into native JavaScript objects
  }

  onMount(() => {
    loadSwagger(swaggerUrl)
    

  })

</script>

<svelte:head>
  {#if swagger}
    <title>{swagger.info.title}</title>
  {:else}
    <title>Swagger UI using Svelte</title>
  {/if}
</svelte:head>

<main>

    <div class="rf-container">
      {#if swagger}
        <h1 class="title">{swagger.info.title}</h1>
        <h2 class="subtitle">{swagger.info.description} - {swagger.info.version}</h2>
    <div class="rf-grid-row">
      {#if swagger.info.contact}
        <div class="rf-col-xs-12 rf-col-lg-4">
          <a href="{swagger.info.contact.url}" target="_blank">{swagger.info.contact.name}</a> - 
          {swagger.info.contact.email}
        </div>
      {/if}
      <div class="rf-col-offset-4"></div>
      <div class="rf-col-xs-12 rf-col-lg-4">
        <label class="rf-label" for="text-input-text">Server:</label>
        <input class="rf-input" type="text" placeholder="Server URL" bind:value={baseurl}  id="text-input-text" name="text-input-text">
      </div>
    </div>

        {#each Object.entries(paths) as category, routeIdx}
          <div class="box">
            <h3 class="title is-small is-3">{ category[0] }</h3>
            {#each category[1] as method, methodIdx}
              <div class="box">
                <div class="rf-grid-row" on:click="{() =>  active[method['id']] = !active[method['id']]}">
                  <a class="rf-btn rf-background--{method.method}" href="{null}">
                    {method.method}
                  </a>
                  <div class="rf-btn rf-btn--secondary">
                    {method.route}
                  </div>
                  {#if method.summary}
                    <div class="rf-btn rf-btn--secondary">
                    { method.summary }
                    </div>
                  {/if}
                </div>
                <div class="swagger-method-details open" class:open={active[method['id']]} >
                  {#if method.requestBody && method.requestBody.content}
                  {#each Object.entries(method.requestBody.content) as requestBody }
                    <div class="swagger-parameters">
                      <h4 class="subtitle">Request Body - {requestBody[0]}</h4>
                      <div class="table-container">
                        <table class="rf-table" style="width: 100%;">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Type</th>
                            <tr>
                        </thead>
                        <tbody>
                            {#if '$ref' in requestBody[1]["schema"]}
                            {#each Object.entries(getSchema(requestBody[1]["schema"]["$ref"]).properties) as property}
                            <tr>
                              <td>
                                <span>
                                  { property[0] }
                                </span>
                              </td>
                              <td>{@html property[1].description }</td>
                              <td>
                                {#if property[1].type}
                                  { property[1].type}
                                {:else}
                                  String
                                {/if}
                              </td>
                            </tr>
                            {/each}
                          {:else}
                          {#each Object.entries(requestBody[1]["schema"]["properties"]) as property}
                            <tr>
                              <td>
                                <span>
                                  { property[0] }
                                </span>
                              </td>
                              <td>{@html property[1].description }</td>
                              <td>
                                {#if property[1].type}
                                  { property[1].type}
                                {:else}
                                  String
                                {/if}
                              </td>
                            </tr>
                          {/each}
                          {/if}
                        </tbody>
                      </table>
                      <br>
                      {#if '$ref' in requestBody[1]["schema"]}
                        <div class="rf-input-group">
                          <label class="rf-label" for="textarea-{method['id']}">Example</label>
                          <textarea class="rf-input" id="textarea-{method['id']}" name="textarea" placeholder="Fixed size textarea" bind:value={requestBodyExample[method['id']]}></textarea>
                        </div>
                      {/if}
                      </div>
                    </div>
                  {/each}
                  {/if}
                  {#if method.parameters && method.parameters.length > 0}
                    <div class="swagger-parameters">
                      <h4 class="subtitle">Parameters</h4>
                      <div class="table-container">
                        <table class="rf-table" style="width: 100%;">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Input</th>
                            <th>Description</th>
                            <th>Located in</th>
                            <th>Type</th>
                            <tr>
                        </thead>
                        <tbody>
                          {#each method.parameters as parameter}
                            <tr>
                              <td>
                                {#if parameter.required}
                                  <span class="swagger-parameter-required">
                                    { parameter.name }
                                  </span>
                                {:else}
                                  <span>
                                    { parameter.name }
                                  </span>
                                {/if}
                              </td>
                              <td>
                                <input class="rf-input" type="text" placeholder="{parameter.name}" bind:value={requestParams[`${method['id']}-${parameter.name}`]} >
                              </td>
                              <td>{@html parameter.description }</td>
                              <td>{parameter.in }</td>
                              <td>
                                {#if parameter.type}
                                  { parameter.type}
                                  {#if parameter.items }
                                    of
                                    { parameter.items.type }
                                  {/if}
                                {:else}
                                  String
                                {/if}
                              </td>
                            </tr>
                          {/each}
                        </tbody>
                      </table>
                      </div>
                    </div>
                  {/if}
                  <button class="rf-btn" on:click={() => handleRequest(method.route, method.method, method.id, method.parameters)}>
                    Execute
                  </button>
                  {#if responses[method['id']] }
                    <p>Url:  {responses[method['id']].url}
                    </p>
                    <h4>Result</h4>
                    <div class="rf-callout">
                      <div class="rf-grid-row">
                        <div class="rf-col-xs-12 rf-col-lg-2">
                          {responses[method['id']].status}
                          <p> {responses[method['id']].statusText}
                          </p>
                        </div>
                        <div class="rf-col-xs-12 rf-col-lg-10">
                          <p> Headers:
                          </p>
                          <pre><code>
                        {[...responses[method['id']].headers.entries()].map(x => x.join(": ")).join(" \n")}
                          </code></pre>
                          {#if Object.keys(responses[method['id']].body).length === 0 && responses[method['id']].body.constructor === Object}
                            <p> Body:
                            </p>
                            {JSON.stringify(responses[method['id']].body, null, 2)}
                          {/if}
                        </div>
                      </div>
                    </div>
                  {/if}
                  {#if method.responses}
                    <div class="swagger-response">
                      <h4>Responses</h4>
                      {#each Object.entries(method.responses) as response}
                        <div class="rf-callout">
                          <div class="rf-grid-row">
                            {#each Object.entries(response[1].content) as content}
                              <div class="rf-col-xs-12 rf-col-lg-2">
                                {response[0]}
                                <p>
                                  { response[1].description }
                                </p>
                              </div>
                              <div class="rf-col-xs-12 rf-col-lg-10">
                                Content-type: {content[0]}
                                {#if '$ref' in content[1].schema}
                                  <ul>
                                    Example: <br>
                                    <pre><code>
                                {JSON.stringify(getSchema(content[1].schema["$ref"]).example, null, 2)}
                                    </code></pre>
                                    {#each Object.entries(getSchema(content[1].schema["$ref"]).properties) as property}
                                      <!---
                                        {#each Object.entries(property[1]) as responseProperties}
                                          {#if responseProperties[0] === '$ref'}
                                            Schema: <br>
                                            <pre><code>
                                {JSON.stringify(getSchema(responseProperties[1]), null, 2)}
                                            </code></pre>
                                          {/if}
                                        {/each}
                                        --->
                                    {/each}
                                  </ul>
                                {/if}
                              </div>
                            {/each}
                          </div>
                        </div>
                      {/each}
                    </div>
                  {/if}

                </div>
              </div>
              <br>
            {/each}
          </div>
        {/each}
      {/if}

    </div>
</main>
