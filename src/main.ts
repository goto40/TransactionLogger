import './app.css'
import App from './App.svelte'

export let serviceWorkerRegistration: ServiceWorkerRegistration|undefined = undefined;
export let serviceWorkerVersion = 'unknown';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener("message", (event) => {
    //console.log(`The service worker sent me a message: ${event.data}`);
    if (event.data === 'NEW-VERSION-DETECTED') {
      console.log('trigger reinstall');
      serviceWorkerRegistration?.active?.postMessage('REINSTALL');
    }
    if (event.data === 'RESTART') {
      console.log('restart page');
      window.location.reload()
    }
    if (`${event.data}`.startsWith('HELLO. ')) {
      console.log('version received', event.data);
      serviceWorkerVersion = `${event.data}`.substring(7);
    }
  });
  navigator.serviceWorker.register('./service-worker.js').then(reg=>{
    serviceWorkerRegistration = reg;
    serviceWorkerRegistration.active?.postMessage('CHECK_FOR_NEW_VERSION');
  })
  console.log('registered service worker');
}
else {
  console.log('service worker not supported!');
}

// refresh after service worker update
let refreshing = false;
navigator.serviceWorker.addEventListener('controllerchange', () => {
  if (!refreshing) {
    console.log('new service worker detected!');
    window.location.reload()
    refreshing = true;
  }
})

const app = new App({
  target: document.getElementById('app')!,
})

export default app
