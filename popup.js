function updateDownload(kalturaID) {
    if (chrome.runtime.lastError) {
        kalturaID = null;
    }

    let errMsg = document.getElementById('err-msg');
    let downloadButton = document.getElementById('download');

    if (kalturaID) {
        errMsg.style.display = "none";
        downloadButton.style.display = "inline-block";
        downloadButton.setAttribute("data-kaltura-id", kalturaID);
        downloadButton.onclick = downloadVideo;
    }
    else {
        showErrMsg('No video found.');
        downloadButton.style.display = "none";
    }
}

function showErrMsg(content) {
    let errMsg = document.getElementById('err-msg');
    errMsg.innerHTML = content;
    errMsg.style.display = "block";
}

function downloadVideo() {
    let kalturaID = this.getAttribute('data-kaltura-id');
    console.log("download " + kalturaID);

    let xhr = new XMLHttpRequest();
    xhr.ontimeout = () => {
        showErrMsg('XMLHttpRequest timed out.');
    };
    xhr.onload = () => {
        console.log('in onload');
        console.log(xhr.readyState);
        if (xhr.readyState === xhr.DONE) {
            if (xhr.status === 200) {
                let resp = xhr.responseXML;
                let media = xhr.responseXML.getElementsByTagName('media')[0];
                chrome.tabs.create({url: media.getAttribute('url')});
            }
            else {
                showErrMsg(xhr.statusText);
            }
        }
    };

    xhr.open(
        'GET',
        'https://cdnapisec.kaltura.com/p/1/sp/2/playManifest/entryId/' + kalturaID,
        true
    );
    xhr.send(null);
}

document.addEventListener("DOMContentLoaded", () => {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        chrome.tabs.sendMessage(
            tabs[0].id,
            {from: 'popup', subject: 'DOMInfo'},
            updateDownload
        );
    });
});
