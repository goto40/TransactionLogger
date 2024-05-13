<script lang="ts">
  import TransactionList from "./lib/TransactionList.svelte";
  import { version } from "../package.json";
</script>

<div class="main-screen">
  <div>Transaction Logger {version}</div>
  <TransactionList />
</div>

<style>
  .main-screen {
    flex: 1 0 0;
    display: flex;
    flex-direction: column;
    background-color: blueviolet;
    color: yellow;
    padding: 5px;
  }
</style>
