// https://stackoverflow.com/a/55431653
class ExtractPageVariable {
  constructor(variableName) {
    this._variableName = variableName;
    this._handShake = this._generateHandshake();
    this._inject();
    this._data = this._listen();
  }

  get data() {
    return this._data;
  }

  // Private

  _generateHandshake() {
    const array = new Uint32Array(5);
    return window.crypto.getRandomValues(array).toString();
  }

  _inject() {
    function propagateVariable(handShake, variableName) {
      const message = { handShake };
      message[variableName] = window[variableName];
      window.postMessage(message, "*");
    }

    const script = `( ${propagateVariable.toString()} )('${this._handShake}', '${this._variableName}');`
    const scriptTag = document.createElement('script');
    const scriptBody = document.createTextNode(script);

    scriptTag.id = 'chromeExtensionDataPropagator';
    scriptTag.appendChild(scriptBody);
    document.body.append(scriptTag);
  }

  _listen() {
    return new Promise(resolve => {
      window.addEventListener("message", ({data}) => {
        // We only accept messages from ourselves
        if (data.handShake != this._handShake) return;
        resolve(data);
      }, false);
    })
  }
}

console.log("sentinel loaded!")

chrome.runtime.onMessage.addListener((msg, sender, response) => {
    if (msg.from == "popup" && msg.subject == 'DOMInfo') {
        const windowData = new ExtractPageVariable('kMainPlayerEmbedObject').data;
        windowData.then(data => {
            response(data.kMainPlayerEmbedObject.entry_id);
        });
    }

    return true;
});
