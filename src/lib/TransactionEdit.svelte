<script lang="ts">
  import { onMount } from "svelte";
  import {
    convertDateToHtmlFormat,
    convertHtmlFormatToDate,
  } from "./transaction";
  export let date: Date;
  export let category: string;
  export let categories: string[];
  export let info: string;
  export let amount: number;
  export let infoPlaceholder: string;
  let amountField: HTMLInputElement;

  onMount(() => {
    amountField.focus();
    amountField.select();
  });

  const handleDate = (e: Event) => {
    date = convertHtmlFormatToDate((<HTMLInputElement>e.target).value);
  };
</script>

<form class="parent-v-flex">
  <div class="parent-h-flex">
    Date: <input
      name="date"
      type="date"
      value={convertDateToHtmlFormat(date)}
      on:change={(e) => handleDate(e)}
    /><br />
  </div>
  <div class="parent-h-flex">
    Amount:
    <input
      class="amount-input flex-fill"
      bind:this={amountField}
      name="amount"
      type="number"
      bind:value={amount}
    />
  </div>
  <div class="category-input parent-h-flex">
    Category:
    <select class="flex-fill" name="category" bind:value={category} on:click>
      {#each categories as possibleCategory}
        <option value={possibleCategory}>{possibleCategory}</option>
      {/each}
    </select>
  </div>
  <div class="parent-h-flex">
    Info:
    <input
      size="5"
      class="flex-fill"
      name="info"
      type="text"
      placeholder={infoPlaceholder}
      bind:value={info}
    />
  </div>
</form>

<style>
  .amount-input {
    font-size: 1.5em;
    min-width: 50px;
  }
</style>
