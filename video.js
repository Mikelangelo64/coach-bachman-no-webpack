var videoHandler = function () {
    var videoArr = document.querySelectorAll('.video');
    if (videoArr.length === 0) {
        return;
    }
    videoArr.forEach(function (video) {
        if (!video) {
            return;
        }
        var source = video.querySelector('source');
        if (!source) {
            return;
        }
        var dataSrc = source.dataset.src;
        if (!dataSrc) {
            return;
        }
        source.src = dataSrc;
        video.load();
        video.addEventListener('loadeddata', function () {
            setTimeout(function () {
                video.classList.add('loaded');
            }, 0);
        });
    });
};
document.addEventListener('DOMContentLoaded', function () {
    videoHandler();
});
