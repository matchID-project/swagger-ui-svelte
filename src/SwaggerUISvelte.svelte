<script lang="ts">
  import { onMount } from 'svelte';
  // compatibility issues when importing module
  // import type { OpenAPIV3 } from "openapi-types";
  // let swagger: OpenAPIV3.Document = null;

  export let swaggerUrl = 'swagger-example.json';

  let swagger = null;
  let active = {};
  let responses = {};
  let requestParams = {}
  let requestBodyExample = {}
  let swaggerOrganized = {};

  const loadSwagger = async (swaggerUrl) => {
    const res = await fetch(swaggerUrl)
    swagger = await res.json()

    Object.entries(swagger.paths).forEach(route => {
     const category =  Object.values(route[1])[0].tags[0];
     Object.entries(route[1]).map(method => {
       if (category in swaggerOrganized) {
         swaggerOrganized[category].push({
         route: route[0],
         method: method[0],
         ...method[1]
        });
       } else {
         swaggerOrganized[category] = [{
         route: route[0],
         method: method[0],
         ...method[1]
        }];
       }
     })
    })

    console.log("iiii", swaggerOrganized);
    // method.requestBody.content
    // JSON.stringify(getSchema(requestBody[1]["schema"]["$ref"]).example)
  }

  const useFilter = (arr) => {
    return arr.filter((elem, pos, array) => {
      return array.indexOf(elem) == pos;
    });
  }

  const getSchema = (refName) => {
    const division = refName.replace("#/", "").split("/")
    return swagger[division[0]][division[1]][division[2]]
  }

  const handleRequest = async (route, method, routeIdx, methodIdx) => {
  console.log("smaple", requestBodyExample);
    // const reqBody = Object.entries(requestBodyExample).filter(x => x[0].indexOf(`${routeIdx}-${methodIdx}-`) > -1)
    const reqParams = Object.entries(requestParams).filter(x => x[0].indexOf(`${routeIdx}-${methodIdx}-`) > -1)
    const params = {}
    if (reqParams.length > 0) {
      reqParams.forEach(x => params[`${x[0].split("-")[2]}`] = x[1])
    }

    const queryString = Object.keys(params).map(key => key + '=' + params[key]).join('&');
    const url = `${route}?${queryString}`
    const response = await fetch(url, {
      method: method.toUpperCase(), // *GET, POST, PUT, DELETE, etc.
      // mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      // body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    console.log(response);
    responses[`${routeIdx}-${methodIdx}`] = response
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
  <section class="section">
    <div class="container">
      {#if swagger}
        <h1 class="title">{swagger.info.title}</h1>
        <h2 class="subtitle">{swagger.info.description} - {swagger.info.version}</h2>
        <p>
          {#if swagger.info.contact}
          <a href="{swagger.info.contact.url}" target="_blank">{swagger.info.contact.name}</a> - 
          {swagger.info.contact.email}
          {/if}
        </p>
        {#each Object.entries(swaggerOrganized) as category, routeIdx}
          <div class="swagger-paths is-small">
            <h3 class="title is-small is-3">{ category[0] }</h3>
            {#each category[1] as method, methodIdx}
              <div class="swagger-method swagger-method-{ method.method }">
                <div class="swagger-method-title" on:click="{() =>  active[`${routeIdx}-${methodIdx}`] = !active[`${routeIdx}-${methodIdx}`]}">
                  <a class="swagger-method-link" href="{null}">
                    <span class="swagger-method-name">{method.method}</span>
                    {method.route}
                    {#if method.summary}
                      - { method.summary }
                    {/if}
                  </a>
                </div>
                <div class="swagger-method-details open" class:open={active[`${routeIdx}-${methodIdx}`]} >
                  {#if method.requestBody && method.requestBody.content}
                  {#each Object.entries(method.requestBody.content) as requestBody }
                    <div class="swagger-parameters">
                      <h4 class="subtitle">Request Body - {requestBody[0]}</h4>
                      <div class="table-container">
                      <table class="table is-hoverable is-fullwidth">
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
                      {#if '$ref' in requestBody[1]["schema"]}
                        Example:
bind:value={getSchema(requestBody[1]["schema"]["$ref"]).example}
{JSON.stringify(getSchema(requestBody[1]["schema"]["$ref"]).example)}
                        <textarea class="textarea has-fixed-size" placeholder="Fixed size textarea" ></textarea>
                      {/if}

                      </div>
                    </div>
                  {/each}
                  {/if}
                  {#if method.parameters && method.parameters.length > 0}
                    <div class="swagger-parameters">
                      <h4 class="subtitle">Parameters</h4>
                      <div class="table-container">
                      <table class="table is-hoverable">
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
                                <input class="input is-rounded" type="text" placeholder="{parameter.name}" bind:value={requestParams[`${routeIdx}-${methodIdx}-${parameter.name}`]} >
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
                  {#if (method.parameters && method.parameters.length > 0) || (method.requestBody && method.requestBody.content)}
                  <button class="button is-primary is-fullwidth" on:click={() => handleRequest(method.route, method.method, routeIdx, methodIdx)}>
                    Execute
                  </button>
                  {/if}
                  {#if responses[`${routeIdx}-${methodIdx}`] }
                    <p> {responses[`${routeIdx}-${methodIdx}`].url}
                    </p>
                    <div class="columns">
                      <div class="column is-narrow">
                        {responses[`${routeIdx}-${methodIdx}`].status}
                      </div>
                      <div class="column">
                        {responses[`${routeIdx}-${methodIdx}`].statusText}
                        <pre><code>
                        {[...responses[`${routeIdx}-${methodIdx}`].headers.entries()].map(x => x.join(": ")).join(" \n")}
                        </code></pre>
                      </div>
                    </div>
                  {/if}
                  {#if method.responses}
                    <div class="swagger-response">
                      <h4>Responses</h4>
                      {#each Object.entries(method.responses) as response}
                        <h5>
                        </h5>
                        <div class="columns">
                          {#each Object.entries(response[1].content) as content}
                          <div class="column is-narrow">
                            {response[0]}
                          </div>
                          <div class="column">
                            <p>
                              { response[1].description }
                            </p>
                            <p>
                              {content[0]}
                            </p>
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
                      {/each}
                    </div>
                  {/if}

                </div>
              </div>
            {/each}
          </div>
        {/each}
      {/if}

    </div>
  </section>
</main>
