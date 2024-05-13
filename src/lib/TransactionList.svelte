<script lang="ts">
  import AppLogo from "../assets/logo.svg";
  import TransactionGroupComponent from "./TransactionGroup.svelte";
  import {
    type Transaction,
    type TransactionClickEvent,
    type TransactionUpdateEvent,
  } from "./transaction";
  import { type NewTransactionEvent } from "./location";
  import ModalTransactionEdit from "./ModalTransactionEdit.svelte";
  import ModalMainMenu from "./ModalMainMenu.svelte";
  import ModalTransactionNew from "./ModalTransactionNew.svelte";
  import { TransactionStore } from "./TransactionStore";
  let transactions = new TransactionStore();
  let showMainMenu = false;
  let showNewDialog = false;
  let transactionGroups = transactions.getGroups();
  let categories = transactions.getCategories();
  let knownTransactionLocations = transactions.getLocations();
  let transactionToEdit: Transaction | undefined = undefined;
  let errors = transactions.getErrors();
  let hasError = false;
  let maxDistance = transactions.getParameters().maxDistance;
  $: hasError = errors.length > 0;
  const handleTransactionClick = (e: CustomEvent<TransactionClickEvent>) => {
    errors = transactions.getErrors();
    if (errors.length === 0) {
      transactionToEdit = e.detail.transaction; // show modal
    }
  };
  const transactionUpdate = (e: CustomEvent<TransactionUpdateEvent>) => {
    transactions.updateTransaction(
      e.detail.originalTransaction.id,
      e.detail.newTransaction,
    );
    transactionGroups = transactions.getGroups();
  };
  const transactionDelete = (e: CustomEvent<Transaction>) => {
    transactions.deleteTransaction(e.detail.id);
    transactionGroups = transactions.getGroups();
  };
  const transactionNew = (e: CustomEvent<NewTransactionEvent>) => {
    transactions.newTransaction(e.detail.newTransaction);
    //console.log("new...");
    transactionGroups = transactions.getGroups();
    if (e.detail.location !== undefined) {
      transactions.newLocation(e.detail.location);
      knownTransactionLocations = transactions.getLocations();
    }
  };
  const handleMainMenuButton = () => {
    showMainMenu = true;
  };
  $: mainMenuAction(showMainMenu);
  const mainMenuAction = (v: boolean) => {
    if (v === false) {
      transactionGroups = transactions.getGroups();
      categories = transactions.getCategories();
      knownTransactionLocations = transactions.getLocations();
      errors = transactions.getErrors();
      maxDistance = transactions.getParameters().maxDistance;
    }
  };
  const handleNewButton = () => {
    showNewDialog = true;
  };
  const handleClearAndArchive = () => {
    transactions.clearAndUpdateArchive();
    transactionGroups = transactions.getGroups();
  };
  const handleReset = () => {
    transactions.reset();
    transactionGroups = transactions.getGroups();
  };
</script>

<div class="transaction-list">
  <ModalMainMenu
    bind:showModal={showMainMenu}
    {transactions}
    on:clearAndArchive={() => handleClearAndArchive()}
    on:reset={() => handleReset()}
  />
  <ModalTransactionEdit
    {categories}
    bind:transaction={transactionToEdit}
    on:transactionUpdate={(e) => transactionUpdate(e)}
    on:transactionDelete={(e) => transactionDelete(e)}
  />
  <ModalTransactionNew
    bind:showModal={showNewDialog}
    {categories}
    {maxDistance}
    {knownTransactionLocations}
    on:transactionNew={(e) => transactionNew(e)}
  />
  {#each transactionGroups as transactionGroup (transactionGroup.id)}
    <TransactionGroupComponent
      {transactionGroup}
      on:transactionClick={handleTransactionClick}
    />
  {/each}
  <button
    class="add-button"
    disabled={hasError}
    on:click={() => handleNewButton()}>+</button
  >
  <button
    class="menu-button {errors.length > 0
      ? 'menu-button-error'
      : 'menu-button-ok'}"
    on:click={() => handleMainMenuButton()}
  >
    <img src={AppLogo} class="logo" width="40px" alt="App Logo" />
  </button>
</div>

<style>
  .transaction-list {
    flex: 1 0 0;
    overflow-y: scroll;
    background-color: black;
    padding: 0px;
  }
  .add-button {
    all: unset;
    background: darkslateblue;
    color: white;
    position: fixed;
    bottom: 10px;
    left: 10px;
    width: 50px;
    height: 50px;
    border-radius: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
  }
  .menu-button {
    all: unset;
    position: fixed;
    left: 10px;
    top: 10px;
    width: 50px;
    height: 50px;
    border-radius: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .menu-button-ok {
    background: lightblue;
  }
  .menu-button-error {
    background: red;
  }
</style>
