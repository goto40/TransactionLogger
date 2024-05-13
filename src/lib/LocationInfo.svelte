<script lang="ts">
  let count: number = 0;
  let countWithData: number = 0;
  let info: string = "no info";
  let state: "on" | "err" = "on";
  let progressSymbols2 = ["\u{1F5FA}\uFE0F", "\u{1F4E1}", "\u{1F6F0}\uFE0F"];
  let progressSymbols = [
    "\u{1F550}",
    "\u{1F551}",
    "\u{1F552}",
    "\u{1F553}",
    "\u{1F554}",
    "\u{1F555}",
    "\u{1F556}",
    "\u{1F557}",
    "\u{1F558}",
    "\u{1F559}",
    "\u{1F55A}",
    "\u{1F55B}",
  ];
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition((pos) => {
      //const age = (Date.now() - pos.timestamp) / 1000.0;
      info = `Lat: ${pos.coords.latitude}\nLong: ${pos.coords.longitude}`;
      count++;
    });
  } else {
    state = "err";
    info = "geolocation not supported";
  }
</script>

<div
  class="geolocation-info"
  style={state === "on" ? "background:#d0f0d0" : "background:#f0d0d0"}
>
  {state === "on"
    ? `${progressSymbols[count % progressSymbols.length]}${progressSymbols2[count % progressSymbols2.length]}`
    : "\u{1F329}\uFE0F"}<br />
  {info}
</div>
