(function( window, document ) {

    "use strict";

    function id(elem){
        return document.getElementById(elem);
    }
    function tg(elem){
        return document.getElementsByTagName(elem);
    }
    function qs(elem){
        return document.querySelector(elem);
    }
    function cs(elem){
        return document.getElementsByClassName(elem);
    }

    var video = document.getElementsByTagName('video')[0],
        videoControls = id('video_controls'),
        videoTitles = id('video_titles'),
        videoContainer = id('video_container'),
        play = id('play'),

        playProgressInterval,
        isTheatreModeOn = false,
        isFullScreenOn = false,
        isMouseOver,

        mainContainer = id("main_container"),
        container = id("container"),
        progressContainer = id("progress"),
        progressHolder = id("progress_box"),
        playProgressBar = id("play_progress"),
        progressHandle = id("progress_handle"),

        fullScreenToggleButton = id("full_screen"),
        theatreModeButton = id("theatre"),

        tot_time = id('tott'),
        cur_time = id('curt'),

        overLay = id('olay'),
        overLayImg = id("olay_img"),

        taskItems = document.querySelectorAll(".task"),
        i,
        len = taskItems.length,

        taskItem,
        taskItemClassName = "video_ele",
        taskItemOnContext,

        menu = id("context_menu"),
        menuItems = menu.querySelectorAll(".context_menu_item"),
        menuState = 0,
        menuPos,

        active = "context_menu_active",

        menuPostion,
        menuPostionX,
        menuPostionY,
        menuHeight,
        menuWidth,

        windowHeight,
        windowWidth,

        clickCoords,
        clickCoordsX,
        clickCoordsY,

        videoSize,
        userImg = id("user_img"),
        loaded = id("play_loaded"),
        thumbs = id("thumbs"),
        div = id("thumb_img"),
        tmDiv = id("thumb_time"),

        info = id("info"),
        infoBox = id("info_box"),


        container = id("scroll_container"),
        scrollbar_v = id("scrollbar_v"),
        bar_v = id("bar_v"),
        content = id("scroll_content"),
        container_ht = container.offsetHeight,
        content_ht = content.offsetHeight,

        playlist = id("playlist"),

        wd = {
            ww : window.screen.availWidth,
            wh : window.screen.availHeight
        },

        ie = (function () { // Borrowed from Padolsey
            var undef,
                v = 3,
                div = document.createElement('div'),
                all = div.getElementsByTagName('i');

            while (
                div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
                all[0]
            );

            return v > 4 ? v : undef;

        }());

    var videoPlayer = {

        init : function () {
            console.log(window.location.search);
            if ( ie < 9 ) return;
            var that = this; // 'this' is equal to the videoPlayer object.
            videoPlayer.pPause();
            videoPlayer.refresh();
            videoPlayer.crtTime();
            videoPlayer.copyVLink();
            if (id("vid_embed")) videoPlayer.embedLink(); // for video embedding
            videoSize = {
                w : video.clientWidth,
                h : video.clientHeight
            }
            videoControls.style.opacity = 1;
            videoTitles.style.opacity = 1;

            document.documentElement.className = "js"; // Helpful CSS trigger for JS.
//            video.removeAttribute("controls"); // Get rid of the default controls, because we'll use our own.
            video.controls = false;
            video.addEventListener("loadeddata", this.initializeControls, false); // When meta data is ready, show the controls
            this.handleButtonPresses(); // When play, pause buttons are pressed.
            theatreModeButton.addEventListener("click", function () {
                isTheatreModeOn ? that.theatreOff() : that.theatreOn();
            }, true);
            fullScreenToggleButton.addEventListener("click", function () {
                if (!document.fullscreenElement || !document.webkitFullscreenElement || !document.mozFullScreenElement || !document.msFullscreenElement) {
                    that.fullScreenOn();
/**/                    videoSize.w = window.screen.availWidth; videoSize.h = window.screen.availHeight;
                    container.style.cssText = "width: " + window.screen.width + "px ; height: " + window.screen.height +"px;";
                    // videoContainer.style.cssText = "width: 100%; height: 100%";
                    video.removeAttribute("controls");
                    menu.style.zIndex = "5555555555";
                    videoTitles.style.zIndex = "5555555555";
                    videoControls.style.zIndex = "5555555555";
                    fullScreenToggleButton.innerHTML = ' <img src="img/sprite.svg#svgView(viewBox(200, 100, 100, 100))" style="width: 15px; height: 15px; margin-top: 2px;"> ';
                    theatreModeButton.style.display = "none";
                } else {
                    that.fullScreenOff();
                    if (isTheatreModeOn) {
                        videoSize.w = "1000"; videoSize.h = "562";
                    } else {
                        videoSize.w = "750"; videoSize.h = "422";
                    }
                    video.removeAttribute("controls");
                    menu.style.zIndex = "";
                    videoTitles.style.zIndex = "";
                    videoControls.style.zIndex = "";
                    fullScreenToggleButton.innerHTML = ' <img src="img/sprite.svg#svgView(viewBox(200, 0, 100, 100))" style="width: 15px; height: 15px; margin-top: 2px;"> ';
                    theatreModeButton.style.display = "block";
                }
            }, true);
            this.trackPlayProgress();
            this.videoScrubbing();

            this.contextListener();
            this.clickListener();
            this.keyUpListener();
            this.resizeListener();
            this.allPlay();
            this.hoverImg();
            // this.modalFunc();
            this.infoShow();
            this.goToTime();

            // console.log( id("scroll_content"));
        },

        initializeControls : function () {

            videoPlayer.showHideControls(); // When all meta information has loaded, show controls
            videoPlayer.durDisplay();

            /* -- fadeOut -- */
            var box1 = id("box1"),
                box2 = id("box2");
            function fadeOut(ele, speed) {
                if (!ele.style.opacity) {
                    ele.style.opacity = 1;
                }
                setInterval(function () {
                    ele.style.opacity -= 0.035;
                }, speed);
            }

            // fadeOut(box2, 20);
            /* -- fadeOut -- */

            /* -- eventListening -- */
            var box1 = id("box1");


            function addEvent(obj, evt, fn, capt) {
                if (obj.attachEvent) {
                    obj.attachEvent("on"+evt, fn);
                } else {
                    if (!capt) capt = false;
                    obj.addEventListener(evt, fn, capt);
                }
            }

            box2.style.position = "absolute";
            if (!box2.style.top) box2.style.top = 0;
            var slideV = false;
            function toggleSLide() {
                if (!slideV) {
                    var hB = box2.offsetHeight;
                    box2.style.top = ( parseInt(box2.style.top) + (box2.offsetHeight)) + "px";
                    box2.style.height = 0+"px";
                    box2.setAttribute("ht", box2.offsetHeight);
                    box2.setAttribute("tp", parseInt(box2.style.top));
                    slideV = true;
                } else {
                    var ht = parseInt(box2.getAttribute("ht")),
                        tp = parseInt(box2.getAttribute("tp")),
                        add = ht - tp;
                    box2.removeAttribute("ht");
                    box2.removeAttribute("tp");
                    box2.style.top = ( add ) + "px";
                    box2.style.height =  ht +"px";
                    slideV = false;
                }
                console.log(slideV);
                console.log(add);
            }

            addEvent(box1, "click", toggleSLide);
            /* -- eventListening -- */


        },

        showHideControls : function () { // Shows and hides the video controls.
            video.addEventListener("mouseover", function () {
                isMouseOver = true;
                videoControls.style.opacity = 1;
                videoTitles.style.opacity = 1;
                userImg.style.top = "50px";
            }, false);

            videoControls.addEventListener("mouseover", function () {
                isMouseOver = true;
                videoControls.style.opacity = 1;
                videoTitles.style.opacity = 1;
                userImg.style.top = "50px";
            }, false);

            videoTitles.addEventListener("mouseover", function () {
                isMouseOver = true;
                videoControls.style.opacity = 1;
                videoTitles.style.opacity = 1;
                userImg.style.top = "50px";
            }, false);

            userImg.addEventListener("mouseover", function () {
                isMouseOver = true;
                videoControls.style.opacity = 1;
                videoTitles.style.opacity = 1;
                userImg.style.top = "50px";
            }, false);

            video.addEventListener("mouseleave", function () {
                isMouseOver = false;
                videoControls.style.opacity = 0;
                videoTitles.style.opacity = 0;
                userImg.style.top = "15px";
                if (video.paused) {
                    videoControls.style.opacity = 1;
                    videoTitles.style.opacity = 1;
                    userImg.style.top = "50px";
                }
            }, false);

            videoControls.addEventListener("mouseleave", function () {
                isMouseOver = false;
                videoControls.style.opacity = 0;
                videoTitles.style.opacity = 0;
                userImg.style.top = "15px";
                if (video.paused) {
                    videoControls.style.opacity = 1;
                    videoTitles.style.opacity = 1;
                    userImg.style.top = "50px";
                }
            }, false);

            videoTitles.addEventListener("mouseleave", function () {
                isMouseOver = false;
                videoControls.style.opacity = 0;
                videoTitles.style.opacity = 0;
                userImg.style.top = "15px";
                if (video.paused) {
                    videoControls.style.opacity = 1;
                    videoTitles.style.opacity = 1;
                    userImg.style.top = "50px";
                }
            }, false);

        },

        handleButtonPresses : function () {
            video.addEventListener("click", this.playPause, false); // When the video or play button is clicked, play/pause the video.
            play.addEventListener("click", this.playPause, false);

            video.addEventListener("play", function () { // When the play button is pressed, switch to the "Pause" symbol.
                play.title = "Pause";
                play.innerHTML = ' <img src="img/sprite.svg#svgView(viewBox( 0, 100, 100, 100))" style="width: 15px; height: 15px; margin-top: 3px;"> ';
                id("vid_pp").innerHTML = "Pause";

                if ( !isTheatreModeOn ) {
                    overLayImg.innerHTML = '<img src="img/sprite.svg#svgView(viewBox( 100, 0, 100, 100))" style="width: 150px; height: 150px; position: absolute; top: calc(50% - 75px); left: calc(50% - 75px); z-index: 1">';
                    overLay.style.display = "block";
                } else {
                    overLayImg.innerHTML = '<img src="img/sprite.svg#svgView(viewBox( 100, 0, 100, 100))" style="width: 200px; height: 200px; position: absolute; top: calc(50% - 100px); left: calc(50% - 100px); z-index: 1">';
                    overLay.style.display = "block";
                }

                setTimeout( function () {
                    overLayImg.innerHTML = '';
                    overLay.style.display = "none";
                }, 500);

                if ( video.ended ) {
                    overLayImg.innerHTML = '';
                    overLay.style.display = "none";
                }


                videoPlayer.trackPlayProgress(); // Track play progress
            }, false);

            video.addEventListener("pause", function () { // When the pause button is pressed, switch to the "Play" symbol.
                play.title = "Play";
                play.innerHTML = ' <img src="img/sprite.svg#svgView(viewBox(0, 0, 100, 100))" style="width: 15px; height: 15px; margin-top: 3px;"> ';
                id("vid_pp").innerHTML = "Play";

                if ( !isTheatreModeOn ) {
                    overLayImg.innerHTML = '<img src="img/sprite.svg#svgView(viewBox(100, 100, 100, 100))" style="width: 150px; height: 150px; position: absolute; top: calc(50% - 75px); left: calc(50% - 75px); z-index: 1">';
                    overLay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
                    overLay.style.display = "block";
                } else {
                    overLay.innerHTML = '<img src="img/sprite.svg#svgView(viewBox(100, 100, 100, 100))" style="width: 200px; height: 200px; position: absolute; top: calc(50% - 100px); left: calc(50% - 100px); z-index: 1">';
                    overLay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
                    overLay.style.display = "block";
                }

//                setTimeout( function () {
//                    overLayImg.innerHTML = '';
//                    overLay.style.display = "none";
//                }, 500);

                if ( video.ended ) {
                    overLayImg.innerHTML = '';
                    overLay.style.display = "none";
                }

                videoPlayer.stopTrackingPlayProgress(); // Video paused, do not track..

            }, false);

            video.addEventListener('ended', function () { // When the video has concluded, pause it.
                this.currentTime = 0;
                this.pause();
            }, false);
        },

        playPause : function () {
            if ( video.paused || video.ended ) {
                if ( video.ended ) {
                    video.currentTime = 0;
                }
                video.play();
            } else {
                video.pause();
            }
        },

        allPlay : function () {
            overLay.addEventListener("click", this.playPause, false);
        },

        theatreOn : function () {
            isTheatreModeOn = true;
            videoContainer.style.cssText = "width: 1000px; height: 562px";
/**/            videoSize.w = "1000"; videoSize.h = "562";
            userImg.style.height = "75px";

            video.style.cssText = "position: absolute; width: 1000px";  // Set new width according to window width
            mainContainer.style.backgroundColor = "#000000";

            theatreModeButton.innerHTML = ' <img src="img/sprite.svg#svgView(viewBox(300, 100, 100, 100))" style="width: 15px; height: 15px; margin-top: 3px;"> ';
            theatreModeButton.title = "Theatre Off";

            video.classList.add = "fullsize_video";
            videoControls.className = "th_control";
//            theatreModeButton.classList.add = "fs_active control"; // Apply a classname to the video and controls, if the designer needs it...
            document.addEventListener("keydown", this.checkKeyCode, false);

//            videoPlayer.hoverImg();
        },

        theatreOff : function () {
            isTheatreModeOn = false;
            videoContainer.style.cssText = "width: 750px; height: 422px";
/**/            videoSize.w = "750"; videoSize.h = "422";
            userImg.style.height = "60px";
            video.style.cssText = '';
            mainContainer.style.backgroundColor = "";

            theatreModeButton.innerHTML = ' <img src="img/sprite.svg#svgView(viewBox(300, 0, 100, 100))" style="width: 15px; height: 15px; margin-top: 3px;"> ';
            theatreModeButton.title = "Theatre On";

            video.style.position = 'static';
            video.classList.remove = 'fullsize_video';

//            theatreModeButton.className = "control";
            videoControls.className = "";
            videoControls.style.opacity = 1;

//            videoPlayer.hoverImg();
        },

        fullScreenOn : function () {
            console.log("fullScreenOn");
            video.removeAttribute("controls"); // Get rid of the default controls, because we'll use our own.
            if (video.requestFullScreen) {
                video.requestFullScreen();
            } else if (video.webkitRequestFullScreen) {
                video.webkitRequestFullScreen();
            } else if (video.mozRequestFullScreen) {
                video.mozRequestFullScreen();
            } else if (video.msRequestFullScreen) {
                video.msRequestFullScreen();
            }

            document.addEventListener("keydown", this.checkKeyCode, false);
        },

        fullScreenOff : function () {
            console.log("fullScreenOff");
            if (video.exitFullScreen) {
                video.exitFullScreen();
            } else if (video.cancelFullScreen) {
                video.cancelFullScreen();
            } else if (video.webkitCancelFullScreen) {
                video.webkitCancelFullScreen();
            } else if (video.mozCancelFullScreen) {
                video.mozExitFullScreen();
            } else if (video.msExitFullScreen) {
                video.msExitFullScreen();
            }
            videoControls.className = "";
        },

        checkKeyCode : function(e) {
            e = e || window.event;
            if ( ( e.keyCode || e.which ) === 27 ) {
                videoPlayer.theatreOff();
                videoPlayer.fullScreenOff();
            }
        },

        trackPlayProgress : function () {
            (function progressTrack() {
                videoPlayer.updatePlayProgress();
                playProgressInterval = setTimeout( progressTrack, 50 );
            })();
        },

        updatePlayProgress : function (){
            var playPercent = ((video.currentTime / video.duration) * 100 ).toFixed(8),

            buffered = function(e) {
                if (video.readyState == 4) {
                    var range = 0,
                        bf = video.buffered,
                        dur = video.duration,
                        time = video.currentTime,
                        bufferedPercent;

//                    while(!(bf.start(range) <= time && time <= bf.end(range))) {
//                        range += 1;
//                    }
//                    var bufferedStartPercentage = (bf.start(range) / video.duration)*100;
//                    var bufferedEndPercentage = (bf.end(range) / video.duration)*100;

                    if (video.buffered.length > 0 && video.duration) {
                        bufferedPercent = (bf.end(bf.length - 1) / dur)*100;
                        return bufferedPercent.toFixed(8);
                    } else if (video && video.bytesTotal !== undefined && video.bytesTotal > 0 && video.bufferedBytes !== undefined) {
                        bufferedPercent = (video.bufferedBytes / video.bytesTotal)*100;
                        return bufferedPercent.toFixed(8);
                    } else if (e && e.lengthComputable && e.total !== 0) {
                        bufferedPercent = (e.loaded / e.total)*100;
                        return bufferedPercent.toFixed(8);
                    }
                }
            };

            playProgressBar.style.width = playPercent + "%";
//            progressHandle.style.display = "none";
            progressHandle.style.left = playPercent + "%";
            id("progress_handle_back").style.left = playPercent + "%";

            video.addEventListener("progress", function(e) {
                console.log(e)
                loaded.style.width = buffered() + '%';
            }, false);

            if (video.readyState == 1) {
                id("waiting").style.display = "block";
            } else {
                id("waiting").style.display = "none";
            }
            if (video.readyState == 2) {
                console.log("STATE 2");
            }
            if (video.readyState == 3) {
                console.log("STATE 3");
            }
            if (video.readyState == 4) {

            }
            videoPlayer.curDisplay();
        },

        stopTrackingPlayProgress : function () {
            clearTimeout( playProgressInterval );
        },

        videoScrubbing : function () {
            progressHolder.addEventListener("mousedown", function () {
                videoPlayer.stopTrackingPlayProgress();
//                videoPlayer.playPause(); ////////

                document.onmousemove = function(e) {
                    videoPlayer.setPlayProgress( e.pageX );
                }

                progressHolder.onmouseup = function(e) {
                    document.onmouseup = null;
                    document.onmousemove = null;

                    video.play();
                    videoPlayer.setPlayProgress( e.pageX );
                    videoPlayer.trackPlayProgress();
                }
            }, true);
        },

        setPlayProgress : function( clickX ) {
            var perC = Math.max( 0, Math.min ( 1, ( clickX - this.findPosX( progressHolder ) ) / progressHolder.offsetWidth ) );
            video.currentTime = perC * video.duration;
            playProgressBar.style.width = perC * ( progressHolder.offsetWidth ) + "px";
        },

        findPosX : function( progressHolder ) {
            var curL = progressHolder.offsetLeft;
            while ( progressHolder = progressHolder.offsetParent ) {
                curL += progressHolder.offsetLeft;
            }
            return curL;
        },

        hoverImg : function(dur) {
            progressHolder.addEventListener("mousemove", function(e) {
            var progBarWidth = progressContainer.offsetWidth,
                dur = video.duration,
                hoverPos = e.pageX - progressHolder.offsetLeft - videoContainer.offsetLeft - 5,
                hoverPosPerc,
                tm,
                mn,
                sc,
                nos;


                if (hoverPos <= 0) {
                    hoverPos = 0;
                } else if (hoverPos > progBarWidth) {
                    hoverPos = progBarWidth;
                }

                hoverPosPerc = (hoverPos / progBarWidth)*100;

                tm = Math.round(dur * (hoverPos / progBarWidth));
                mn = Math.floor(tm / 60);
                sc = Math.floor(tm - (mn * 60));

                if (mn < 10) {
                    mn = "0" + mn;
                }
                if (sc < 10) {
                    sc = "0" + sc;
                }
                var percent = 100/nos,
                    noone = nos - 1,
                    i = 0,
                    j = 0;

//                console.log(j +" "+progBarWidth+" "+hoverPos+" "+hoverPosPerc.toFixed(4)+"%"+" "+mn+":"+sc+" calculated_time: "+dur);

                thumbs.style.display = "block";
                thumbs.style.left =  hoverPosPerc+"%";
                div.style.cssText = "position: absolute; width: 150px; height: 84px; background: url('img/R9ymE.jpg') 10px 0px / 1500px 84px";
                tmDiv.innerHTML = mn+":"+sc;
            }, false);
            progressContainer.addEventListener("mouseleave", function () {
                thumbs.style.display = "none";
            }, false);
        },

        durDisplay : function () {
            var durMins = Math.floor(video.duration / 60);
            var durSecs = Math.floor(video.duration - (durMins * 60));

            if (durMins < 10) {
                durMins = "0" + durMins;
            }
            if (durSecs < 10) {
                durSecs = "0" + durSecs;
            }

            tot_time.innerHTML = durMins + ":" + durSecs;
//            console.log(video.duration);
        },

        curDisplay : function () {
            var curMins = Math.floor(video.currentTime / 60);
            var curSecs = Math.floor(video.currentTime - (curMins * 60));

            if (curMins < 10) {
                curMins = "0" + curMins;
            }
            if (curSecs < 10) {
                curSecs = "0" + curSecs;
            }
            var curTime = curMins + ":" + curSecs;
            cur_time.innerHTML = curTime;
//            if (curTime == "00:01") {
//                video.pause();
//            }
        },

        clickInsideElement : function(e, className) {
            var el = e.srcElement || e.target;
    //        console.log(el);
            if (el.classList.contains(className)) {
    //            console.log(el);
                return el;
            } else {
                while (el = el.parentNode) {
                    if (el.classList && el.classList.contains(className)) {
    //                    console.log(el);
                        return el;
                    }
                }
            }

            return false;
        },

        contextListener : function(el) {
            if (video.addEventListener) {
                video.addEventListener('contextmenu', function(e) {
                    if (videoPlayer.clickInsideElement(e, taskItemClassName)) {
                        e.preventDefault();
                        videoPlayer.toggleMenuOn();
                        videoPlayer.positionMenu(e);
                    } else {
                        videoPlayer.toggleMenuOff();
                    }
                }, false);
            } else {
                video.attachEvent('oncontextmenu', function () {
                    if (videoPlayer.clickInsideElement(e, taskItemClassName)) { // videoPlayer. added not reqd .. ??
                        window.event.returnValue = false;
                        videoPlayer.toggleMenuOn();
                        videoPlayer.positionMenu(e);
                    } else {
                        videoPlayer.toggleMenuOff();
                    }
                });
            }
        },

        clickListener : function () {
            document.addEventListener("click", function(e) {
                var button = e.which || e.button;
                if (button === 1) {
                    videoPlayer.toggleMenuOff();
                }
            }, false);
        },

        keyUpListener : function () {
            window.onkeyup = function(e) {
                if (e.keyCode === 27) {
                    videoPlayer.toggleMenuOff();
                }
            }
        },

        resizeListener : function () {
            window.onresize = function(e) {
                videoPlayer.toggleMenuOff();
            }
        },

        getPosition : function(e) {
            menuPos = {
                left : e.offsetX,
                top : e.offsetY
            }

            return {
                x : menuPos.left,
                y : menuPos.top
            }
        },

        positionMenu : function(e) {

        clickCoords = videoPlayer.getPosition(e);
//        console.log(menuPostion); /* loggs entry two times */
        clickCoordsX = clickCoords.x;
        clickCoordsY = clickCoords.y;

        menuWidth = menu.offsetWidth + 1;
        menuHeight = menu.offsetHeight + 1;

        windowWidth = videoSize.w;
        windowHeight = videoSize.h;
//            console.log("CX : "+clickCoordsX +" CY : " +clickCoordsY+" WW : " +windowWidth+" WH : " +windowHeight+" MW :"+menuWidth+" MH :"+menuHeight+" ORG : "+(windowWidth - clickCoordsX)+" SUB : "+(windowWidth - menuWidth));

        if ((windowWidth - clickCoordsX) < menuWidth) {
            menu.style.left = clickCoordsX - menuWidth + "px"; /* can be windowWidth - menuWidth + "px"; */
        } else {
            menu.style.left = clickCoordsX + "px";
        }

        if ((windowHeight - clickCoordsY) < menuHeight) {
            menu.style.top = clickCoordsY - menuHeight + "px"; /* can be windowHeight - menuHeight + "px"; */
        } else {
            menu.style.top = clickCoordsY + "px";
        }
    },

    toggleMenuOn : function () {
        if (menuState !== 1) {
            menuState = 1;
            menu.classList.add(active);
        }
    },

    toggleMenuOff : function () {
        if (menuState !==0) {
            menuState = 0;
            menu.classList.remove(active);
        }
    },

    pPause : function () {
        id("vid_pp").addEventListener("click", function () {
            videoPlayer.playPause();
        }, false);
    },

    refresh : function () {
        id("vid_refresh").addEventListener("click", function () {
            window.location.reload();
        }, false);
    },

    crtTime : function () {
        id("vid_crt_time").addEventListener("click", function(e) {
            // var textToCopy = window.location.origin + window.location.pathname +"?tm="+video.currentTime,
            var textToCopy = window.location.href +"?tm="+video.currentTime,
                target = e.target.id;
            videoPlayer.linkDisplay(textToCopy, target);
        }, false);

    },

    copyVLink : function () {
        id("vid_link").addEventListener("click", function(e) {
            // var textToCopy = window.location.origin + window.location.pathname,
            var textToCopy = window.location.href,
                target = e.target.id;
            videoPlayer.linkDisplay(textToCopy, target);
        }, false);
    },

    embedLink : function () {
        id("vid_embed").addEventListener("click", function(e) {
            // var textToCopy = window.location.origin + window.location.pathname +"?tm="+video.currentTime,
            var textToCopy ='<iframe width="640" height="360" src="/VideoControls/player.php?v=' + window.location.search + '" frameborder="0" allowfullscreen></iframe>',
                target = e.target.id;
            videoPlayer.linkDisplay(textToCopy, target);
        }, false);

    },

    linkDisplay : function(textToCopy, target) {
        var copyDiv = document.createElement("div"),
            closeBtn = document.createElement("div"),
            textEle = document.createElement("input");
        //            textEle.setAttribute("type", "text");
        closeBtn.innerHTML = "<span style=\"line-height: 31px; margin-left: 10px;\">X</span>";
        textEle.setAttribute("value", textToCopy);
        textEle.setAttribute("readonly", "readonly");
        textEle.className = "copy_current";
        copyDiv.className = "copy_item";
        closeBtn.className = "close_btn";
        copyDiv.appendChild(textEle);
        copyDiv.appendChild(closeBtn);
        videoContainer.appendChild(copyDiv);
        textEle.select();

        if (target === "vid_embed") {
            copyDiv.style.cssText = "left:"+ parseInt((menu.offsetLeft / video.offsetWidth)*100) +"%; top:"+  parseInt(((menu.offsetTop + 124) / video.offsetHeight)*100) +"%";
        } else if (target === "vid_crt_time") {
            copyDiv.style.cssText = "left:"+ parseInt((menu.offsetLeft / video.offsetWidth)*100) +"%; top:"+  parseInt(((menu.offsetTop + 93) / video.offsetHeight)*100) +"%";
        } else if (target === "vid_link") {
            copyDiv.style.cssText = "left:"+ parseInt((menu.offsetLeft / video.offsetWidth)*100) +"%; top:"+  parseInt(((menu.offsetTop + 62) / video.offsetHeight)*100) +"%";
        }
        closeBtn.addEventListener("click", function () {
            videoContainer.removeChild(copyDiv);
        })
    },

//    copyToClipboard : function(text) {
//        var txtArea = document.createElement("textarea");
//        menu.appendChild(txtArea);
//        txtArea.innerHTML = text;
//        // Select some text (you could also create a range)
//        txtArea.select();
//        // Use try & catch for unsupported browser
//        try {
//            // The important part (copy selected text)
//            var successful = document.execCommand('copy');
//
//            if(successful) alert('Copied!');
//            else alert('Unable to copy!');
//        } catch (err) {
//            alert('Unsupported Browser!');
//        }
//        menu.removeChild(txtArea);
//    },

    plusClass : function(e, cl) {
        e.className = e.className + " " + cl;
    },

    minusClass : function(e, cl) {
        var classes = e.className.split(" ");
        newClass = [];
        for (var i = 0; i < classes.length; i++) {
            if (classes[i] == cl) {
                continue;
            }
            newClass.push(classes[i]);
        }
        e.className = newClass.join(" ");
    },

    resetClass : function(e) {
        var class_to_remove = ['slideup','slidedown','facein','fadeout'];
        var each_class = e.className.split(" ");
        newclass = [];
        for (i=0 ; i < each_class.length ; i++) {
            if(class_to_remove.indexOf(each_class[i]) >= 0){
                continue;
            }
            newclass.push(each_class[i]);
        }
        el.className = newclass.join(" ");
    },

    infoShow : function () {
        var isInfoBoxOpen = false;
        info.addEventListener("click", function () {
            if (isInfoBoxOpen === false) {
                infoBox.style.display = "block";
                isInfoBoxOpen = true;
                userImg.style.display = "none";
                playlist.style.display = "none";
            } else {
                infoBox.style.display = "none";
                isInfoBoxOpen = false;
                userImg.style.display = "block";
                playlist.style.display = "block";
                scrollFun.initElement("bar_v");
            }
        }, false);
    },

    modalFunc : function () {
        var showHide = id("modal_button"),
            closeBtn = cs("close"),
            clseNum = closeBtn.length,
            saveBtn = cs("save")[0],
            modal = id("myModal"),
            actModal = cs("modal_content")[0],
            modalBody = cs("modal_body")[0];

        /* ---- TOGGLE BUTTON FUNCTION ---- */
        var isToggle = false;
        id("toggle_bg").style.backgroundColor = "red";
        id("toggle_bg").addEventListener("click", function () {
            if (isToggle === false) {
                isToggle = true;
                id("toggle_bg").style.backgroundColor = "green";
            } else {
                isToggle = false;
                id("toggle_bg").style.backgroundColor = "red";
            }
            console.log(isToggle);
        }, false);
        /* ---- TOGGLE BUTTON FUNCTION ---- */



//        actModal.style.cssText = "top: "+(-actModal.offsetWidth)+"px"; /*  Top to bottom  */


        showHide.addEventListener("click", function () {

            if (isToggle) {
                var p1 = document.createElement("p"),
                    p2 = document.createElement("p");
                p1.innerHTML = " Pariatur coniunctione na est doctrina multos lorem expetendis quae, occaecat dolore fore tempor fore, nulla mentitum ut fugiat varias ne eram velit.";
                p2.innerHTML = " Lorem ipsum dolor sit amet, consectetur adipisicing elit. Qui incidunt reprehenderit inventore esse nobis at autem, voluptatibus quidem aspernatur velit commodi architecto ratione quibusdam, laborum accusamus perspiciatis consequatur officia, similique. ipsum dolor sit amet, consectetur adipisicing elit. In ut omnis velit quos error aliquam quod ab ad illo qui explicabo labore impedit totam laborum odio, voluptatibus nam, consectetur, voluptate! In incurreret ut summis id labore, se quorum quem non quamquam ne ipsum officia probant, summis id ad illum deserunt an ne ut irure elit duis. Multos ut e quorum officia. sed multos ullamco ab imitarentur a cillum qui quibusdam ea aute ne veniam litteris. Iis voluptate ad admodum.";
                modalBody.appendChild(p1);
                modalBody.appendChild(p2);
            }


            modal.style.display = "block";
            actModal.style.cssText = "left:"+parseInt( (window.innerWidth - actModal.offsetWidth) / 2)+"px; top:"+parseInt( (window.innerHeight - actModal.offsetHeight) / 2 )+"px";

                    console.log("WinWidth: "+window.outerWidth+" ModWidth: "+actModal.offsetWidth+" FarakWidth: "+(window.outerWidth - actModal.offsetWidth));
                    console.log("WinHeight: "+window.outerHeight+" ModHeight: "+actModal.offsetHeight+" FarakHeight: "+(window.outerHeight - actModal.offsetHeight));

        }, false);
        saveBtn.addEventListener("click", function () {
            console.log("SAVE..");
        }, false);
//
        for (var a = 0; a < clseNum; a++) {
            closeFun(closeBtn[a]);
        }

        function closeFun(ele) {
            ele.addEventListener("click", function () {
//                actModal.style.cssText = "left:"+parseInt((window.outerWidth - actModal.offsetWidth) / 2)+"px; top:"+(-actModal.offsetWidth)+"px"; /*  Top to bottom  */
                modal.style.display = "none"; /*  Normal  */
                modalBody.innerHTML = "";
            }, false);
        }

        window.addEventListener("resize", function () {
            actModal.style.cssText = "left:"+parseInt( (document.documentElement.clientWidth - actModal.offsetWidth) / 2)+"px; top:"+parseInt( (window.innerHeight - actModal.offsetHeight) / 2 )+"px";
            console.log(window_h+" "+window_w);
        }, false);
    },

    goToTime : function () {
        //        var getParams = function(url) {
//            var parse = function(params, pairs) {
//                var pair = pairs[0],
//                    parts = pair.split("="),
//                    key = decodeURIComponent(parts[0]),
//                    value = decodeURIComponent(parts.slice(1).join("="));
//                if (typeof params === "undefined") {
//                    params[key] = value;
//                } else {
//                    params[key] = [].concat(params[key], value);
//                }
//                return pairs.length == 1 ? params : parse(params, pairs.slice(1));
//            }
//            return url.length == 0 ? {} : parse({}, url.substr(1).split("&"));
//        }
//        var params = getParams(location.search);

        function getUrlParameters(searchString) {
            var pageURL = window.location.search.substring(1),
                variableURL = pageURL.split("&");
            for (var i = 0; i < variableURL.length; i++) {
                var pair = variableURL[i].split("="),
                    paraName = pair[0],
                    paraMeter = pair[1];
                if (searchString !== undefined) {
                    if (paraName === searchString) {
                        return paraMeter;
                    }
                }
            }
        }
//        var URLS = getUrlParameters("tm");
//        console.log(URLS);
        if (getUrlParameters("tm")) {
            //            console.log(getUrlParameters("tm"))
            var hrSplit = getUrlParameters("tm").split("h");
            if (getUrlParameters("tm").indexOf("h") !== -1) {
                var hours = hrSplit[0],
                    mins = hrSplit[1].split("m")[0],
                    secs = hrSplit[1].split("m")[1].split("s")[0],
                    timeGiven = parseInt(hours * 3600) + parseInt(mins * 60) + parseInt(secs);
                video.addEventListener("loadedmetadata", function () {
                    this.currentTime = timeGiven;
//                console.log("Hours Too \n"+ hours+" : "+mins+" : "+secs+" = "+timeGiven);
                }, false);
            } else {
                var mins = getUrlParameters("tm").split("m")[0],
                    secs = getUrlParameters("tm").split("m")[1].split("s")[0],
                    timeGiven = parseInt(mins * 60) + parseInt(secs);
                video.addEventListener("loadedmetadata", function () {
                    this.currentTime = timeGiven;
//                console.log("Only Minutes \n" + mins+" : "+secs+" = "+timeGiven);
                }, false);
            }
        }
    }
};

    videoPlayer.init();

var scrollFun = {
        initialMouseX: undefined,
        initialMouseY: undefined,
        objStartX: undefined,
        objStartY: undefined,
        draggedObject: undefined,
        initElement: function (element) {

            if (typeof element == 'string') {
                element = document.getElementById(element);
                // if (element === null) {
                //     element = document.getElementsByClassName(element)[0];
                // }
                // console.log(element);
            }

            if ( content_ht > container_ht ) {
                scrollbar_v.style.display = "block";
                console.log("false "+content_ht+" "+container_ht);
                element.style.height = ( (container_ht / content_ht) * 100 ) + "%";
            } else {
                scrollbar_v.style.display = "none";
                console.log("true "+content_ht+" "+container_ht);
            }

            container.onmouseover = function () {
                element.style.visibility = "visible";
            }
            container.onmouseout = function () {
                element.style.visibility = "hidden";
            }


            element.onmousedown = scrollFun.startDragMouse;
        },
        startDragMouse: function (e) {
            scrollFun.startDrag(this);
            var evt = e || window.event;
            // scrollFun.initialMouseX = evt.clientX;
            scrollFun.initialMouseY = evt.clientY;
            scrollFun.addEventSimple(document, 'mousemove', scrollFun.dragMouse);
            scrollFun.addEventSimple(document,'mouseup', scrollFun.releaseElement);
            return false;
        },
        startDrag: function (obj) {
            if (scrollFun.draggedObject) scrollFun.releaseElement();
            // scrollFun.objStartX = obj.offsetLeft;
            scrollFun.objStartY = obj.offsetTop;
            scrollFun.draggedObject = obj;
            obj.className += ' dragstart';
        },
        dragMouse: function (e) {
            var evt = e || window.event;
            // var dX = evt.clientX - scrollFun.initialMouseX;
            var dY = evt.clientY - scrollFun.initialMouseY;
            var element = scrollFun.draggedObject;
            scrollFun.setPosition(dY);    // (dx, dy) if wnt to use the both axes
            element.className = scrollFun.draggedObject.className.replace(/ dragstart/,'');
            if (scrollFun.hasClass( element, "dragged" ) === false) {
                element.className += " dragged";
            }
            element.style.visibility = "visible";
            return false;
        },
        setPosition: function (dy) {    // (dx, dy) if wnt to use the both axes
            var element = scrollFun.draggedObject;
            // var newX = scrollFun.objStartX + dx;
            var newY = scrollFun.objStartY + dy;
            // scrollFun.draggedObject.style.left = scrollFun.objStartX + dx + 'px';
            // console.log(element.offsetTop)
            // console.log(scrollbar_v.offsetHeight)
            if (newY >= 0) {
                if (newY + element.offsetHeight <= scrollbar_v.offsetHeight) {
                    element.style.top = newY + 'px';          // set elements new position to these credentials
                    var max_text_top = container_ht - content_ht,
                        max_scroll_top = scrollbar_v.offsetHeight - element.offsetHeight,
                        scale_factor = (max_text_top / max_scroll_top);
                        content.style.top = newY * scale_factor;
                }
            }
        },
        releaseElement: function () {
            scrollFun.removeEventSimple(document, 'mousemove', scrollFun.dragMouse);
            scrollFun.removeEventSimple(document, 'mouseup', scrollFun.releaseElement);
            scrollFun.draggedObject.className = scrollFun.draggedObject.className.replace(/ dragged/,'');
            scrollFun.draggedObject = null;
            bar_v.style.visibility = "hidden";
        },
        hasClass : function(element, cls) {
            return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
        },
        addEventSimple : function(obj, evt, fn, bubb) {
            if (!bubb) bubb = false;
            if (obj.addEventListener)
                obj.addEventListener(evt, fn, bubb);
            else if (obj.attachEvent)
                obj.attachEvent('on'+evt, fn);
        },
        removeEventSimple : function(obj, evt, fn, bubb) {
            if (!bubb) bubb = false;
            if (obj.removeEventListener)
                obj.removeEventListener(evt, fn, bubb);
            else if (obj.detachEvent)
                obj.detachEvent('on'+evt, fn);
        }
    }

scrollFun.initElement("bar_v");

})( this, document );
