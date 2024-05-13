<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import {
    getDayName,
    getEndDateOfGroup,
    getExtendedSummaryText,
    getGroupWeekNumber,
    getStartDateOfGroup,
    type Transaction,
    type TransactionClickEvent,
    type TransactionGroup,
  } from "./transaction";

  export let transactionGroup: TransactionGroup;
  const handleGroupInfoClick = () => {
    // use a button instead of a div: https://www.reddit.com/r/SvelteKit/comments/17w3rmw/clickable_div_without_a11y_complains_whats_your/
    // all: unset, see below
    //console.log(`click group id ${transactionGroup.id % 100}`);
    transactionGroup.expanded = !transactionGroup.expanded;
  };
  const dispatch = createEventDispatcher<{
    transactionClick: TransactionClickEvent;
  }>();
  const handleTransactionClick = (
    transaction: Transaction,
    group: TransactionGroup,
  ) => {
    // use a button instead of a div: https://www.reddit.com/r/SvelteKit/comments/17w3rmw/clickable_div_without_a11y_complains_whats_your/
    // all: unset, see below
    // console.log(
    //   `click transaction id ${transaction.id}@${(group.id % 100) + 1}`,
    // );
    dispatch("transactionClick", {
      transaction: transaction,
      group: group,
    });
  };
</script>

<div class="transaction-group">
  <button
    class="transaction-group-info"
    on:click={() => handleGroupInfoClick()}
  >
    {getGroupWeekNumber(transactionGroup)}
  </button>
  {#if transactionGroup.expanded}
    <div class="transaction-group-list">
      {#each transactionGroup.transactions as transaction (transaction.id)}
        <div class="transaction-row">
          <button class="transaction" on:click={() => handleGroupInfoClick()}>
            <div class="transaction-line">
              <div class="transaction-date">
                {getDayName(transaction.date)}
                {transaction.date.toLocaleDateString("de-DE")}
              </div>
              <div class="transaction-category">{transaction.category}</div>
            </div>
            <div class="transaction-line">
              <div class="transaction-amount">
                {transaction.amount.toFixed(2)}€
              </div>
              <div class="transaction-info">{transaction.info}</div>
            </div>
          </button>
          <button
            class="transaction-edit"
            on:click={() =>
              handleTransactionClick(transaction, transactionGroup)}
            >&#x270E;</button
          >
        </div>
      {/each}
    </div>
  {:else}
    <button
      class="transaction-group-summary"
      on:click={() => handleGroupInfoClick()}
    >
      {getStartDateOfGroup(transactionGroup).toLocaleDateString("de-DE")}
      ..
      {getEndDateOfGroup(transactionGroup).toLocaleDateString("de-DE")}
      <br />
      {getExtendedSummaryText(transactionGroup)}
    </button>
  {/if}
</div>

<style>
  .transaction-edit {
    all: unset;
    color: #aa4;
    width: 30px;
  }
  .transaction-group {
    background: black;
    display: flex;
    flex-direction: row;
    margin-top: 3px;
    margin-bottom: 3px;
    padding-right: 12px;
  }
  .transaction-row {
    display: flex;
    background: var(--transaction-background-color);
    border-radius: 5px;
    border-color: #555;
    border-style: groove;
    border-width: 1px;
    margin-top: 3px;
    margin-bottom: 3px;
  }
  .transaction-group-info {
    all: unset;
    background: black;
    justify-content: center;
    color: var(--info-color);
    display: flex;
    flex-basis: 20px;
    flex-direction: column;
    margin-top: 3px;
    margin-bottom: 3px;
    padding-left: 5px;
    padding-right: 5px;
  }
  .transaction-group-summary {
    all: unset;
    background: var(--transaction-background-color);
    flex: 1 0 0;
    color: #777;
    display: flex;
    flex-direction: column;
    border-radius: 5px;
    border-color: var(--transaction-border-color);
    border-style: groove;
    border-width: 1px;
    margin-top: 3px;
    margin-bottom: 3px;
  }
  .transaction-group-list {
    background: black;
    display: flex;
    flex: 1 0 0;
    flex-direction: column;
    margin-top: 3px;
    margin-bottom: 3px;
  }
  .transaction {
    all: unset;
    font-size: 0.8em;
    display: flex;
    flex: 1 0 0;
    flex-direction: column;
  }
  .transaction-line {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }
  .transaction-date {
    padding-right: 10px;
    color: #777;
  }
  .transaction-category {
    color: #c9f;
  }
  .transaction-amount {
    padding-right: 10px;
    color: #dd6;
  }
  .transaction-info {
    color: #ccc;
  }
</style>
