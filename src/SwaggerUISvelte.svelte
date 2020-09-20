<script lang="ts">
  import { onMount } from 'svelte';
  export let swagger_url = 'swagger-example.json';

  let swagger;

  onMount(async () => {
    const res = await fetch(swagger_url)
    swagger = await res.json()
    console.log(swagger);
  })

</script>

<main>
  <section class="section">
    <div class="container">
      {#if swagger}
        <h1 class="title">{swagger.info.title}!</h1>
        {#each Object.entries(swagger.paths) as route}
          <div class="swagger-paths is-small">
            <h3 class="title is-small is-3">{ route[0] }</h3>
            {#each Object.entries(route[1]) as method}
              <div class="swagger-method swagger-method-{ method[0] }">
                <div class="swagger-method-title">
                  <a class="swagger-method-link" href="{null}">
                    <span class="swagger-method-name">{ method[0] }</span>
                    { method[1].summary }
                  </a>
                </div>
                <div class="swagger-method-details">
                  {#if method[1].parameters}
                    <div class="swagger-parameters">
                      <h4>Parameters</h4>
                      <table class="table swagger-parameters-table">
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
                              <td>{ parameter.description }</td>
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
