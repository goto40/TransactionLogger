<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import {
    convertDateToSimplLocalHtmlFormat,
    convertHtmlFormatToDate,
  } from "./transaction";
  export let date: Date;
  export let category: string;
  export let categories: string[];
  export let info: string;
  export let amount: number;
  export let amountText: string = `${amount}`;
  export let infoPlaceholder: string;
  let amountField: HTMLInputElement;
  $: amount = Number(amountText.replace(",", "."));
  export let valueOk = true;

  onMount(() => {
    amountField.focus();
    amountField.select();
  });

  const handleDate = (e: Event) => {
    date = convertHtmlFormatToDate((<HTMLInputElement>e.target).value);
  };

  const checkNumber = (e: Event) => {
    const pattern = /^[0-9]+([\.,][0-9]+)?$/;
    if (pattern.test(amountField.value)) {
      console.log(`"${amountField.value}" ok`);
      valueOk = true;
    } else {
      console.log(`"${amountField.value}" not ok`);
      valueOk = false;
    }
  };
</script>

<form class="parent-v-flex">
  <div class="parent-h-flex">
    <label for="date">Date:</label>
    <input
      name="date"
      type="date"
      value={convertDateToSimplLocalHtmlFormat(date)}
      on:change={(e) => handleDate(e)}
    /><br />
  </div>
  <div class="parent-h-flex">
    <label for="amount">Amount:</label>
    <input
      class="amount-input flex-fill"
      bind:this={amountField}
      name="amount"
      type="text"
      inputmode="numeric"
      bind:value={amountText}
      on:keyup={checkNumber}
    />
  </div>
  <div class="category-input parent-h-flex">
    <label for="category">Category:</label>
    <select class="flex-fill" name="category" bind:value={category} on:click>
      {#each categories as possibleCategory}
        <option value={possibleCategory}>{possibleCategory}</option>
      {/each}
    </select>
  </div>
  <div class="parent-h-flex">
    <label for="info">Info:</label>
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
