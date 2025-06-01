<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import TransactionEdit from "./TransactionEdit.svelte";
  import {
    getTransactionGroupId,
    type Transaction,
    type TransactionData,
    type TransactionUpdateEvent,
  } from "./transaction";
  export let transaction: Transaction | undefined;
  const dispatchUpdate = createEventDispatcher<{
    transactionUpdate: TransactionUpdateEvent;
  }>();
  const dispatchDelete = createEventDispatcher<{
    transactionDelete: Transaction;
  }>();
  let date: Date = new Date();
  let category: string = "";
  export let categories: string[];
  let info: string = "";
  let amount: number = 0;
  $: onTransactionChanged(transaction);

  const onTransactionChanged = (t: Transaction | undefined) => {
    if (t !== undefined) {
      amount = t.amount;
      category = t.category;
      date = t.date;
      info = t.info;
      if (!categories.includes(category)) {
        const similar = categories.find(
          (c) => c.toLocaleLowerCase() === category.toLocaleLowerCase(),
        );
        if (similar !== undefined) {
          category = similar;
        } else {
          categories = [category, ...categories];
        }
      }
    }
  };
  const handleCancel = () => {
    transaction = undefined;
  };
  const handleSave = () => {
    if (transaction !== undefined) {
      //console.log(`save ${date}`);
      const originalGroupId = getTransactionGroupId(transaction);
      const newTransaction: TransactionData = {
        amount: amount,
        category: category,
        info: info,
        date: date,
      };
      const newGroupId = getTransactionGroupId(newTransaction);
      dispatchUpdate("transactionUpdate", {
        originalTransaction: transaction,
        newTransaction: newTransaction,
        originalGroupId: originalGroupId,
        newGroupId: newGroupId,
      });
    }
    transaction = undefined;
  };
  const handleDelete = () => {
    if (transaction !== undefined) {
      //console.log(`delete ${date}`);
      dispatchDelete("transactionDelete", transaction);
    }
    transaction = undefined;
  };
  let isDisabled = true;
  let valueOk = true;
  $: isDisabled =
    amount === 0 || info.length === 0 || category.length === 0 || !valueOk;
</script>

{#if transaction !== undefined}
  <button class="backdrop">
    <button class="dialog">
      <div>Edit existing Transaction</div>
      <div class="content">
        <TransactionEdit
          bind:date
          bind:category
          {categories}
          bind:info
          bind:amount
          bind:valueOk
          infoPlaceholder={"what did you spend money on?"}
        />
      </div>
      <div class="button-bar">
        <button class="delete-button" on:click={() => handleDelete()}
          >Delete</button
        >
        <button class="cancel-button" on:click={() => handleCancel()}
          >Cancel</button
        >
        <button
          class="save-button"
          disabled={isDisabled}
          on:click={() => handleSave()}>Save</button
        >
      </div>
    </button>
  </button>
{/if}

<style>
  .delete-button {
    color: lightcoral;
  }
</style>
