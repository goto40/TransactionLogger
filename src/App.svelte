<script lang="ts">
  import TransactionList from "./lib/TransactionList.svelte";
</script>

<div class="main-screen">
  <div>Transaction Logger v27</div>
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
