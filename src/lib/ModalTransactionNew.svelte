<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from "svelte";
  import TransactionEdit from "./TransactionEdit.svelte";
  import { type TransactionData } from "./transaction";
  import {
    distanceInMeters,
    findNearestLocationWithMinimumDistanceInMeters,
    type NewTransactionEvent,
    type TransactionLocation,
  } from "./location";

  // dispatcher

  const dispatchNew = createEventDispatcher<{
    transactionNew: NewTransactionEvent;
  }>();
  const dispatchDel = createEventDispatcher<{
    locationDel: number;
  }>();

  // props

  export let showModal: boolean;
  export let categories: string[];
  export let knownTransactionLocations: TransactionLocation[];
  let sortedTransactionLocations: TransactionLocation[] =
    knownTransactionLocations.slice();

  // variables

  let date: Date = new Date();
  let category: string = "";
  let info: string = "";
  let amount: number = 0;
  let here: GeolocationCoordinates | undefined;
  let infoPlaceholder = "";
  let isStoreDisabled = true;
  let isStoreLocationDisabled = true;
  let categoryWasSelected = false;
  export let maxDistance: number;
  let selectedLocation: TransactionLocation | undefined = undefined;

  // auto variables

  $: onShow(showModal);
  const onShow = (b: boolean) => {
    if (b) {
      categoryWasSelected = false;
      date = new Date();
      category = "";
      info = "";
      amount = 0;
      selectedLocation = undefined;
    }
  };
  $: isStoreLocationDisabled = info.length === 0 || category.length === 0;
  $: isStoreDisabled =
    amount === 0 ||
    (info.length === 0 && infoPlaceholder.length === 0) ||
    category.length === 0;

  $: sortLocationList(here, knownTransactionLocations);
  const sortLocationList = (
    here: GeolocationCoordinates | undefined,
    t: TransactionLocation[],
  ) => {
    if (here !== undefined && selectedLocation === undefined) {
      sortedTransactionLocations = t
        .slice()
        .sort(
          (a, b) =>
            distanceInMeters(here, a.coords) - distanceInMeters(here, b.coords),
        );
    }
  };

  $: infoPlaceholder = computePlaceholder(
    here,
    knownTransactionLocations,
    category !== "" ? category : undefined,
  );
  const computePlaceholder = (
    here: GeolocationCoordinates | undefined,
    knownTransactionLocations: TransactionLocation[],
    category: string | undefined,
  ) => {
    //console.log(`compute placeholder ${here}`);
    if (here === undefined) return "";
    const loc = findNearestLocationWithMinimumDistanceInMeters(
      knownTransactionLocations,
      here,
      maxDistance,
      category,
    );
    if (loc !== undefined) return loc.info;
    else return "";
  };
  $: category = computeCategory(here, knownTransactionLocations);
  const computeCategory = (
    here: GeolocationCoordinates | undefined,
    knownTransactionLocations: TransactionLocation[],
  ) => {
    //console.log("compute category");
    if (categoryWasSelected) return category;
    if (here === undefined) return "";
    const loc = findNearestLocationWithMinimumDistanceInMeters(
      knownTransactionLocations,
      here,
      maxDistance,
    );
    if (loc !== undefined) return loc.category;
    else return category;
  };

  // handler

  const handleCancel = () => {
    showModal = false;
  };
  const handleSave = (storeLoc: boolean) => {
    if (showModal) {
      //console.log(`save new ${date}`);
      const newTransaction: TransactionData = {
        amount: amount,
        category: category,
        info: info.length > 0 ? info : infoPlaceholder,
        date: date,
      };
      if (storeLoc && here !== undefined) {
        //console.log("SAVE", here);
        dispatchNew("transactionNew", {
          newTransaction: newTransaction,
          location: {
            category: category,
            coords: here,
            info: newTransaction.info,
          },
        });
      } else {
        dispatchNew("transactionNew", {
          newTransaction: newTransaction,
          location: undefined,
        });
        showModal = false;
      }
    }
  };

  const handleSelectedLocation = (loc: TransactionLocation) => {
    selectedLocation = loc;
    category = loc.category;
    info = loc.info;
  };

  const handleLocationDelete = (loc: TransactionLocation) => {
    selectedLocation = undefined;
    dispatchDel("locationDel", loc.id);
  };

  // setup

  let geolocationWatchId: number | undefined = undefined;
  onMount(() => {
    if (navigator.geolocation) {
      geolocationWatchId = navigator.geolocation.watchPosition((pos) => {
        const age = (Date.now() - pos.timestamp) / 1000.0;
        //console.log(`age=${age}, coords=${pos.coords}`);
        if (age < 60.0) {
          // age<60, within last minute
          here = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            altitude: pos.coords.altitude,
            heading: pos.coords.heading,
            speed: pos.coords.speed,
            accuracy: pos.coords.accuracy,
            altitudeAccuracy: pos.coords.altitudeAccuracy,
          };
        } else {
          here = undefined;
        }
      });
    }
  });
  onDestroy(() => {
    if (geolocationWatchId !== undefined && navigator.geolocation) {
      navigator.geolocation.clearWatch(geolocationWatchId);
    }
  });
  const handleUnselect = () => {
    selectedLocation = undefined;
  };
  const distance = (loc: TransactionLocation) => {
    if (here === undefined) return "n/a";
    else {
      const d = distanceInMeters(here, loc.coords);
      if (d < 1000) return d.toFixed(0) + "m";
      else return (d / 1000).toFixed(1) + "km";
    }
  };
</script>

{#if showModal}
  <button class="backdrop" on:click={() => handleUnselect()}>
    <button class="my-dialog">
      <div>Edit existing Transaction</div>
      <div class="content">
        <TransactionEdit
          bind:date
          bind:category
          {categories}
          bind:info
          bind:amount
          {infoPlaceholder}
          on:click={() => {
            categoryWasSelected = true;
          }}
        />
      </div>
      <div class="button-bar">
        <button class="cancel-button" on:click={() => handleCancel()}
          >Cancel</button
        >
        <button
          class="save-button"
          disabled={isStoreLocationDisabled || here === undefined}
          on:click={() => handleSave(true)}>+ &#x1F4CD;</button
        >
        <button
          class="save-button"
          disabled={isStoreDisabled}
          on:click={() => handleSave(false)}>New</button
        >
      </div>
      <div class="extra-info">*: save location as well</div>
      <div class="extra-info">
        {here !== undefined
          ? `${here?.latitude}N ${here?.longitude}E`
          : "no location"}
      </div>
      <div class="location-list">
        {#each sortedTransactionLocations as loc (loc.id)}
          <button
            class="entry"
            class:entry-selected={loc.id === selectedLocation?.id}
            on:click|stopPropagation={() => handleSelectedLocation(loc)}
          >
            <div class="loc-info">
              <div class="distance">{distance(loc)}</div>
              <div class="category">{loc.category}</div>
              <div class="info">{loc.info}</div>
            </div>
            {#if loc.id === selectedLocation?.id}
              <button
                class="loc-del"
                on:click|once={() => handleLocationDelete(loc)}>&#x274c;</button
              >
            {/if}
          </button>
        {/each}
      </div>
    </button>
  </button>
{/if}

<style>
  .entry {
    all: unset;
    flex: auto 0 0;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: left;
    align-items: center;
    font-size: 0.9em;
    background-color: #010;
  }
  .entry-selected {
    background-color: #020;
    border-style: solid;
    border-color: #4d4;
    border-width: 1px;
  }
  .distance {
    color: #161;
    font-size: 0.9em;
  }
  .category {
    color: #85a;
    padding-left: 10px;
    font-size: 0.9em;
  }
  .info {
    color: #777;
    padding-left: 10px;
  }
  .location-list {
    flex: 1 0 0;
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
    overflow: auto;
  }
  .extra-info {
    font-size: 0.6em;
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
  .loc-info {
    flex: 1 0 0;
    display: flex;
    flex-direction: row;
  }
  .loc-del {
    all: unset;
    color: #aa4;
    width: 30px;
  }
</style>
