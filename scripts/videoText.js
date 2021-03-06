

$(function(){
	var videoList;
	var currentVideo=0;
	var model = {
		setContentsCalled :false,
		init: function() {
			model.topicId = model.getParameterByName("topic");
			model.lessonId = model.getParameterByName("lesson");
			var topiclists=localStorageGet('topiclists');
			videoList=topiclists[model.topicId].material[model.lessonId];
			if(!localStorageGet('topiclists')||!(/^\d+$/.test(model.topicId))||!model.lessonId||!topiclists[model.topicId]||!videoList)
			{
				$(location).attr('href', 'homepage.html');
			}
			
			model.topicName = topiclists[model.topicId]["topic"];
			if (!localStorageGet('notes')) {
				localStorageSet('notes',{});
			}
		},
		addNewNote: function(obj) {
			var data =localStorageGet('notes');
			if(data[videoList[currentVideo]])
			{
				data[videoList[currentVideo]].notes=obj;
			}
			else
			{
				data[videoList[currentVideo]]={ notes: obj};	
			}
			localStorageSet('notes',data);
			
		},
		addNewjsbin: function(jsbinURL) {
			var data =localStorageGet('notes');
			if(data[videoList[currentVideo]])
			{
				data[videoList[currentVideo]].jsbin=jsbinURL;
			}
			else
			{
				data[videoList[currentVideo]]={ jsbin: jsbinURL};	
			}
			localStorageSet('notes',data);
		},
		getNotesOfCurrentVideo: function() {
			var data=localStorageGet('notes');
			if(data[videoList[currentVideo]])
			{
				return data[videoList[currentVideo]].notes;	
			}
			else
			{
				return false;
			}
		},
		getjsbinOfCurrentVideo: function() {
			var data=localStorageGet('notes');;
			if(data[videoList[currentVideo]])
			{
				return data[videoList[currentVideo]].jsbin;	
			}
			else
			{
				return false;
			}
		},

		getCurrentVideo: function() {
			return videoList[currentVideo];
		},
		getCurrentVideoId: function() {
			return currentVideo;
		},
		getAllVideos: function() {
			return videoList;
		},
		changeCurrentVideo: function(newVideo) {
			currentVideo=newVideo;
		},
		getCurrentLessonName: function(){
			return model.lessonId;
		},
		getCurrentTopicName: function(){
			return model.topicName;
		},
		getParameterByName: function(name, url) {
			if (!url) url = window.location.href;
			name = name.replace(/[\[\]]/g, "\\$&");
			var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
			results = regex.exec(url);
			if (!results) return null;
			if (!results[2]) return '';
			return decodeURIComponent(results[2].replace(/\+/g, " "));
		}
	};


	var octopus = {
		init: function() {
			model.init();
			view.init();
			modalView.init();
			sidePanelView.init();
			youtubeView.init();
			notesView.init();
			jsbinView.init();
		},
		getCurrentVideoId: function() {
			return model.getCurrentVideoId();
		},
		addNewNote: function(noteStr) {
			model.addNewNote(noteStr);
		},
		addNewjsbin: function(jsbinURL) {
			model.addNewjsbin(jsbinURL);
			jsbinView.render();
		},
		getNotesOfCurrentVideo: function() {
			return model.getNotesOfCurrentVideo();
		},
		getjsbinOfCurrentVideo: function() {
			return model.getjsbinOfCurrentVideo();
		},

		getCurrentVideo: function() {
			return model.getCurrentVideo();
		},
		getAllVideos: function() {
			return model.getAllVideos();
		},
		changeCurrentVideo: function(newVideo) {
			model.changeCurrentVideo(newVideo);
			sidePanelView.render();
			youtubeView.render();
			notesView.render();
			jsbinView.render();
		},
		getCurrentLessonName: function(){
			return model.getCurrentLessonName();
		},
		getCurrentTopicName: function(){
			return model.getCurrentTopicName();
		},
		isSetContentsCalled: function(){
			return model.setContentsCalled;
		},
		setContentsCalled: function(val){
			model.setContentsCalled = val;
		},
		enableJSButton: function() {
			notesView.enableJSButton();
		},
		disableJSButton: function() {
			notesView.disableJSButton();
		},
		showModal: function() {
			modalView.jsbinmodal();
		},
		hidemodal: function() {
			modalView.hidemodal();
		},
		changeView: function() {
			view.changeView();
		},
	};
	var sidePanelView = {
		init : function() {
			var videos=octopus.getAllVideos(),
			parent=$("#l1"),
			optSign = $('#bar'),
			sideBlk = $('#lesson-list-container'),
			index,listAppend;
			console.log(sideBlk);
			index=-1;
			listAppend=videos.reduce(function(videoHTMLString){
				index++;
				return videoHTMLString + '<li id="'+ index +'"class="lesson-list-container__lesson--title">Video'+ (parseInt(index)+1) +'</li>';
			},"");
			parent.append(listAppend);
			$("#l1").on("click", function(e) {
				if(e.target && e.target.nodeName == "LI") {
					sideBlk.css('transform','translateX(-100%)');
					optSign.css("visibility", "visible");
					$('#content-styler').css('opacity','1');
					octopus.changeCurrentVideo(e.target.id);
				}
			});
			this.render();
		},
		render : function() {
			var currentVideo=octopus.getCurrentVideoId();
			$('.active').removeClass('active');
			$("#"+currentVideo).addClass('active');
		} 
	}; 
	var youtubeView = {
		init: function() {
			this.videoTag=$(".video");
			this.render();
		},
		render : function() {
			$('#youtube').remove();
			var curVideo=octopus.getCurrentVideo();
			this.videoTag.prepend('<embed  id="youtube" width="100%" height="100%"src="https://www.youtube.com/embed/'+ curVideo+'" frameborder="0" allowfullscreen">');
		}	
	};
	var notesView = {
		init: function() {
			$('#toolbar-top').on('click',function(e){
				if(e.target.id=="save-notes")
				{
					a=advancedEditor.getContents();
					octopus.addNewNote(a);
					$("#save-notes").attr('class','save-notes-btn--grey');
					$("#save-notes").attr('disabled','true');
				}
				else if(e.target.id=="embed-bin-btn")
				{
					octopus.showModal();
				}
				else if(e.target.id=="change-view")
				{
					octopus.changeView();
				}
			});
			advancedEditor.on("text-change",function(delta){
				if(!octopus.isSetContentsCalled()){
					$("#save-notes").removeAttr('disabled');
					$("#save-notes").attr('class','save-notes-btn');
				}
				octopus.setContentsCalled(false);
			});
			this.render();
		},
		render: function() {
			var notes=octopus.getNotesOfCurrentVideo();
			if(notes)
			{
				octopus.setContentsCalled(true);
				advancedEditor.setContents(notes);
			}
			else
			{
				notes=[];
				octopus.setContentsCalled(true);
				advancedEditor.setContents(notes);
			}
		},
		disableJSButton: function() {
			$('.embed-bin-btn').eq(0).attr("disabled",true);
			$('.embed-bin-btn').eq(0).css("background-color",'grey');
		},
		enableJSButton: function() {
			$('.embed-bin-btn').eq(0).removeAttr('disabled');
			$('.embed-bin-btn').eq(0).css("background-color",'#337AB7');
		},
	};
	var modalView = {
		init: function() {
			$('#modal').on('click',function(e){
				if(e.target.id=='hide-jsbin')
				{
					modalView.hidemodal();
				}
				else if(e.target.id=='saveUrl')
				{
					var t2=$("#jsbinUrl").val();
					octopus.addNewjsbin(t2);
					$('.embed-bin-btn').eq(0).attr("disabled",true);
					$('.embed-bin-btn').eq(0).css("background-color",'grey');
				}
			});
		},
		jsbinmodal: function() {
		document.getElementsByClassName('modal-div')[0].style.transform='scale(1)';
		document.getElementById('content-styler').style.opacity=0.2;
		},
		hidemodal: function() {
		document.getElementsByClassName('modal-div')[0].style.transform='scale(0)';
		document.getElementById('content-styler').style.opacity=1;
		},

	};
	var jsbinView = {
		init: function() {
			this.jsbintag=$(".jsbin");
		},
		render: function() {
			var jsbin=octopus.getjsbinOfCurrentVideo();
			if(jsbin)
			{
				octopus.disableJSButton();
				$("iframe").remove();
				this.jsbintag.append('<iframe src=' + jsbin + ' style="border: 1px solid rgb(170, 170, 170); width: 100%; height:100%;min-height: 300px;"></iframe>');
				octopus.changeView();
			}
			else
			{
				octopus.enableJSButton();
				$("iframe").remove();
			}
		}
	};
	var view = {
		init: function() {
			document.getElementById("lesson-anchor").href = "lessonCards.html?topic="+model.topicId;
			var lessonName = $("#lesson-name"), topicName = $("#topic-name");
			lessonName.html(octopus.getCurrentLessonName());
			topicName.html(octopus.getCurrentTopicName());
			view.resizeWindow();
			$(window).eq(0).resize(function(){
				console.log("dasd");
				view.resizeWindow();
			});
		},
		changeView: function(){
			var div = document.getElementById("content-styler");
			if(div.className==="content-style-1")
				div.className="content-style-2";
			else
				div.className="content-style-1";
			view.resizeWindow();
			octopus.hidemodal();
		},
		resizeWindow: function() {
			var toolbarTop = document.getElementById("toolbar-top"),
				toolbarBottom = document.getElementById("toolbar-editor"),
				container = document.getElementById("advance-wrapper"),
				toolbarTopHeight = toolbarTop.offsetHeight,
				containerHeight = container.offsetHeight;
				toolbarBottom.setAttribute("style","height:"+(containerHeight - toolbarTopHeight -5) +"px");
		}

	};

	octopus.init();
});