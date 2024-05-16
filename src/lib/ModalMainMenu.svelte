<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { serviceWorkerRegistration } from "../main";
  import type { TransactionStore } from "./TransactionStore";
  import { licenseText } from "./info";

  const dispatchClear = createEventDispatcher<{
    clearAndArchive: undefined;
  }>();
  const dispatchReset = createEventDispatcher<{
    reset: undefined;
  }>();

  export let transactions: TransactionStore;
  export let showModal: boolean;
  const handleUpdateApp = () => {
    serviceWorkerRegistration?.active?.postMessage("REINSTALL");
  };
  const handleSkipWaiting = () => {
    serviceWorkerRegistration?.active?.postMessage("SKIP_WAITING");
    throw new Error("test123");
  };
  const handleClear = () => {
    dispatchClear("clearAndArchive", undefined);
    showModal = false;
  };
  let resetCounter = 0;
  let setCounter = 0;
  const handleReset = () => {
    resetCounter += 1;
    if (resetCounter > 3) {
      dispatchReset("reset", undefined);
      showModal = false;
    }
  };
  const handleClose = () => {
    //console.log("close menu...");
    if (what === "info") what = "export";
    showModal = false;
  };
  export let firstTime;
  let what:
    | "export"
    | "parameters"
    | "info"
    | "transactions"
    | "categories"
    | "archive"
    | "locations"
    | "errors"
    | "export-archive" = firstTime ? "info" : "export";
  let text: string = "no text";
  $: if (showModal) handleWhat(true);
  const handleWhat = (show: boolean) => {
    resetCounter = 0;
    setCounter = 0;
    if (show && transactions.getErrors().length > 0) {
      what = "errors";
    }
    if (what === "transactions") {
      text = transactions.getTransactionsJson();
    } else if (what === "info") {
      text = "App: " + window.location.href + "\n" + licenseText;
    } else if (what === "categories") {
      text = transactions.getCategoriesJson();
    } else if (what === "export") {
      text = transactions.getExportText();
    } else if (what === "archive") {
      text = transactions.getArchiveJson();
    } else if (what === "export-archive") {
      text = transactions.getArchiveExportText();
    } else if (what === "locations") {
      text = transactions.getLocationsJson();
    } else if (what === "errors") {
      text = transactions.getErrorText();
    } else if (what === "parameters") {
      text = transactions.getParametersJson();
    } else {
      text = "???";
    }
  };
  const handleSet = () => {
    setCounter += 1;
    if (setCounter > 3) {
      setCounter = 0;
      if (what === "transactions") {
        transactions.setTransactionJson(text);
        showModal = false;
      } else if (what === "categories") {
        transactions.setCategoriesJson(text);
        showModal = false;
      } else if (what === "locations") {
        transactions.setLocationsJson(text);
        showModal = false;
      } else if (what === "archive") {
        transactions.setArchiveJson(text);
        showModal = false;
      } else if (what === "parameters") {
        transactions.setParametersJson(text);
        showModal = false;
      }
    }
  };
  const handleGet = () => {
    if (what === "transactions") {
      text = transactions.readStorage("transactions");
    } else if (what === "categories") {
      text = transactions.readStorage("category");
    } else if (what === "locations") {
      text = transactions.readStorage("locations");
    } else if (what === "archive") {
      text = transactions.readStorage("archive");
    } else if (what === "parameters") {
      text = transactions.readStorage("parameters");
    }
  };
  const isEditable = (w: string) => {
    return [
      "transactions",
      "categories",
      "locations",
      "parameters",
      "archive",
    ].includes(w);
  };
</script>

{#if showModal}
  <button class="backdrop">
    <button class="my-dialog">
      <div>Main Menu</div>
      <select name="what" bind:value={what} on:change={() => handleWhat(false)}>
        <option value="export">export</option>
        <option value="parameters">parameters</option>
        <option value="transactions">transactions</option>
        <option value="categories">categories</option>
        <option value="locations">locations</option>
        <option value="archive">archive</option>
        <option value="export-archive">export archive</option>
        <option value="errors">errors</option>
        <option value="info">info</option>
      </select>
      <textarea class="main-menu-text" bind:value={text}></textarea>
      <div class="button-bar">
        <button on:click={() => handleClear()}>Archive</button>
        <button disabled={!isEditable(what)} on:click={() => handleSet()}
          >Set{"!".repeat(setCounter)}</button
        >
        <button disabled={!isEditable(what)} on:click={() => handleGet()}
          >Get</button
        >
        <button on:click={() => handleClose()}>Close</button>
      </div>
      <div>Internal</div>
      <div class="button-bar">
        <button class="internal-button" on:click={() => handleUpdateApp()}
          >Reinstall</button
        >
        <button class="internal-button" on:click={() => handleReset()}
          >Reset {"!".repeat(resetCounter)}</button
        >
        <button class="internal-button" on:click={() => handleSkipWaiting()}
          >(Skip)</button
        >
      </div>
    </button>
  </button>
{/if}

<style>
  .internal-button {
    font-size: 0.8em;
    color: red;
  }
  .main-menu-text {
    flex: 1 0 0;
    margin-bottom: 10px;
    overflow: auto;
    min-height: 80px;
  }
  .my-dialog {
    all: unset;
    flex: 1 0 0;
    background: var(--transaction-background-color);
    color: var(--info-color);
    border-style: double;
    border-color: var(--transaction-border-color);
    display: flex;
    flex-direction: column;
    padding: 10px;
  }
</style>
