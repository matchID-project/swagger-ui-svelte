<script lang="ts">
  import { onMount } from 'svelte';
  // compatibility issues when importing module
  // import type { OpenAPIV3 } from "openapi-types";
  // let swagger: OpenAPIV3.Document = null;

  export let swaggerUrl = 'swagger-example.json';

  let swagger = null;
  let active = {};

  const loadSwagger = async (swaggerUrl) => {
    const res = await fetch(swaggerUrl)
    swagger = await res.json()
  }

  const getSchema = (refName) => {
    const division = refName.replace("#/", "").split("/")
    return swagger[division[0]][division[1]][division[2]]
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
        {#each Object.entries(swagger.paths) as route, routeIdx}
          <div class="swagger-paths is-small">
            <h3 class="title is-small is-3">{ route[0] }</h3>
            {#each Object.entries(route[1]) as method, methodIdx}
              <div class="swagger-method swagger-method-{ method[0] }">
                <div class="swagger-method-title" on:click="{() =>  active[`${routeIdx}-${methodIdx}`] = !active[`${routeIdx}-${methodIdx}`]}">
                  <a class="swagger-method-link" href="{null}">
                    <span class="swagger-method-name">{ method[0] }</span>
                    {#if method[1].summary}
                      { method[1].summary }
                    {/if}
                  </a>
                </div>
                <div class="swagger-method-details open" class:open={active[`${routeIdx}-${methodIdx}`]} >
                  {#if method[1].requestBody && method[1].requestBody.content}
                  {#each Object.entries(method[1].requestBody.content) as requestBody }
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
                      </div>
                    </div>
                  {/each}
                  {/if}
                  {#if method[1].parameters}
                    <div class="swagger-parameters">
                      <h4 class="subtitle">Parameters</h4>
                      <div class="table-container">
                      <table class="table is-hoverable">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Located in</th>
                            <th>Description</th>
                            <th>Type</th>
                            <tr>
                        </thead>
                        <tbody>
                          {#each method[1].parameters as parameter}
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
                              <td>{ parameter.in }</td>
                              <td>{@html parameter.description }</td>
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
                  {#if method[1].responses}
                    <div class="swagger-response">
                      <h4>Responses</h4>
                      {#each Object.entries(method[1].responses) as response}
                        <h5>
                          <span class="swagger-response-code">{ response[0] }</span>
                          { response[1].description }
                        </h5>
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
