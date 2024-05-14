<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from "svelte";
  import TransactionEdit from "./TransactionEdit.svelte";
  import { type TransactionData } from "./transaction";
  import {
    findNearestLocationWithMinimumDistanceInMeters,
    type NewTransactionEvent,
    type TransactionLocation,
  } from "./location";

  // dispatcher

  const dispatchNew = createEventDispatcher<{
    transactionNew: NewTransactionEvent;
  }>();

  // props

  export let showModal: boolean;
  export let categories: string[];
  export let knownTransactionLocations: TransactionLocation[];

  // variables

  let date: Date = new Date();
  let category: string = "";
  let info: string = "";
  let amount: number = 0;
  let here: GeolocationCoordinates | undefined;
  let infoPlaceholder = "";
  let isDisabled = true;
  let categoryWasSelected = false;
  export let maxDistance: number;

  // auto variables

  $: onShow(showModal);
  const onShow = (b: boolean) => {
    if (b) {
      categoryWasSelected = false;
      date = new Date();
      category = "";
      info = "";
      amount = 0;
    }
  };
  $: isDisabled =
    amount === 0 ||
    (info.length === 0 && infoPlaceholder.length === 0) ||
    category.length === 0;

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
      }
    }
    showModal = false;
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
</script>

{#if showModal}
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
          disabled={isDisabled || here === undefined}
          on:click={() => handleSave(true)}>New*</button
        >
        <button
          class="save-button"
          disabled={isDisabled}
          on:click={() => handleSave(false)}>New</button
        >
      </div>
      <div class="extra-info">*: save location as well</div>
      <div class="extra-info">
        {here !== undefined
          ? `${here?.latitude}N ${here?.longitude}E`
          : "no location"}
      </div>
    </button>
  </button>
{/if}

<style>
  .extra-info {
    font-size: 0.6em;
  }
</style>
