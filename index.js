const image = document.getElementById('cover');
const title = document.getElementById('music-title');
const artist = document.getElementById('music-artist');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const progress = document.getElementById('progress');
const playerProgress = document.querySelector('.player-progress');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const playBtn = document.getElementById('play');
const volumeSlider = document.getElementById('volume-slider');
const music = new Audio();
let isPlaying = false;
let progressInterval;
const playlist = [];
let playlistIndex = 0;

function togglePlay() {
    if (isPlaying) {
        pauseMusic();
    } else {
        playMusic();
    }
}

function playMusic() {
    isPlaying = true;
    playBtn.classList.replace('fa-play', 'fa-pause');
    music.play();
}

function pauseMusic() {
    isPlaying = false;
    playBtn.classList.replace('fa-pause', 'fa-play');
    music.pause();
}

playBtn.addEventListener('click', togglePlay);

music.addEventListener('play', () => {
    // Music started playing, update UI
    updateProgressBar();
});

music.addEventListener('pause', () => {
    // Music paused, update UI
    clearInterval(progressInterval);
});

music.addEventListener('ended', () => {
    // Music ended, play next song
    playNextSong();
});

function updateProgressBar() {
    progressInterval = setInterval(() => {
        const { duration, currentTime } = music;
        if (!isNaN(duration)) {
            const progressPercent = (currentTime / duration) * 100;
            progress.style.width = `${progressPercent}%`;
            const formatTime = (time) => String(Math.floor(time)).padStart(2, '0');
            durationEl.textContent = `${formatTime(duration / 60)}:${formatTime(duration % 60)}`;
            currentTimeEl.textContent = `${formatTime(currentTime / 60)}:${formatTime(currentTime % 60)}`;
        }
    }, 1000);
}

playerProgress.addEventListener('click', (e) => {
    const width = playerProgress.clientWidth;
    const clickX = e.offsetX;
    music.currentTime = (clickX / width) * music.duration;
});

function loadMusic(song) {
    music.src = song.path;
    title.textContent = song.displayName;
    
    // ตรวจสอบค่า artist จากข้อมูล ID3 tags
    if (song.artist) {
        artist.textContent = song.artist;
    } else {
        artist.textContent = 'Unknown Artist';
    }

    if (song.imageSrc) {
        image.src = song.imageSrc;
    } else {
        // ใช้รูปภาพเริ่มต้นหรืออื่น ๆ ที่คุณต้องการใช้
        image.src = 'default-image.jpg'; // เปลี่ยนเป็น URL ของรูปภาพที่คุณต้องการใช้
    }

    playMusic();
}


// ตรวจสอบว่ามีการเลือกไฟล์ MP3 ใหม่
const uploadBtn = document.getElementById('upload-btn');
const musicFileInput = document.getElementById('music-file');

uploadBtn.addEventListener('click', () => {
    musicFileInput.click();
});

musicFileInput.addEventListener('change', (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
            const selectedFile = selectedFiles[i];
            const song = {
                path: URL.createObjectURL(selectedFile),
                displayName: selectedFile.name.replace('.mp3', ''),
                artist: 'Unknown Artist',
            };

            jsmediatags.read(selectedFile, {
                onSuccess: function (tag) {
                    if (tag.tags.picture) {
                        const base64String = arrayBufferToBase64(tag.tags.picture.data);
                        const imageSrc = `data:${tag.tags.picture.format};base64,${base64String}`;

                        song.imageSrc = imageSrc;

                        if (playlistIndex === i) {
                            image.src = imageSrc;
                        }
                    }
                },
                onError: function (error) {
                    console.error('Error reading ID3 tags:', error);
                }
            });

            playlist.push(song);
        }
        displayPlaylist();
        if (!isPlaying && playlist.length > 0) {
            loadMusic(playlist[0]);
        }
    }
});

// เพิ่มเงื่อนไขเพื่อตรวจสอบว่า Playlist ไม่ว่างและรูปภาพเริ่มต้นถูกตั้งค่าอย่างถูกต้อง
if (playlist.length > 0 && playlist[0].imageSrc) {
    image.src = playlist[0].imageSrc;
}

function displayPlaylist() {
    const playlistList = document.getElementById('playlist-list');
    playlistList.innerHTML = '';
    for (let i = 0; i < playlist.length; i++) {
        const li = document.createElement('li');
        li.textContent = playlist[i].displayName;
        li.addEventListener('click', () => {
            playlistIndex = i;
            loadMusic(playlist[playlistIndex]);
        });
        playlistList.appendChild(li);
    }
}

volumeSlider.addEventListener('input', () => {
    const volume = volumeSlider.value;
    music.volume = volume;
});

const randomBtn = document.getElementById('random');
const repeatBtn = document.getElementById('repeat');
let isRandom = false;
let isRepeat = false;

randomBtn.addEventListener('click', () => {
    isRandom = !isRandom;
    randomBtn.classList.toggle('active', isRandom);
});

repeatBtn.addEventListener('click', () => {
    isRepeat = !isRepeat;
    repeatBtn.classList.toggle('active', isRepeat);
});

function playNextSong() {
    if (isRandom) {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * playlist.length);
        } while (randomIndex === playlistIndex);
        playlistIndex = randomIndex;
    } else if (isRepeat) {
        // เล่นเพลงซ้ำ
    } else {
        playlistIndex = (playlistIndex + 1) % playlist.length;
    }
    loadMusic(playlist[playlistIndex]);
}

function playPreviousSong() {
    if (isRandom) {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * playlist.length);
        } while (randomIndex === playlistIndex);
        playlistIndex = randomIndex;
    } else if (isRepeat) {
        // เล่นเพลงซ้ำ
    } else {
        playlistIndex = (playlistIndex - 1 + playlist.length) % playlist.length;
    }
    loadMusic(playlist[playlistIndex]);
}

prevBtn.addEventListener('click', playPreviousSong);
nextBtn.addEventListener('click', playNextSong);
