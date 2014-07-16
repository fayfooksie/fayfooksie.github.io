(function() {
	"use strict";

	//variables
	var	Data=null,
		Story=null,
		Scene=null,
		VERSION=1.00;

	//read parameters
	var	config={
			file: "default",
			theme: "default"
			},
		raw=location.search.substr(1).split(/=|&/);
	for(var i=0; i<raw.length; i+=2) {
		config[raw[i]]=decodeURIComponent(raw[i+1]);
		}
	document.getElementById("theme").content=config.theme;

	//load Story
	var	request=new XMLHttpRequest();
	request.open("GET", "file/"+config.file+".json", false);
	request.send();
	Story=request.status===200?
		JSON.parse(request.responseText):{
			M: {
				Title: "NOT FOUND",
				Revision: 0
				},
			P: "Story file '"+config.file+"' not found!"
			};
	Story.E=false;
	Story.P=Story.M.Title
		+"\n\n"+(Story.M.Revision===1?
			"Initial release":
			"Revision "+Story.M.Revision
			)
		+"\n"+Story.P;
	Story.RETURN={
		"Return to Start": Story
		}
	Story.NOSCENE={
		E: false,
		P: "[ERROR] invalid scene",
		C: Story.RETURN
		}

	//setup Story
	Story.PATHS=0;
	Story.TREES=0;
	Story.SEEN=0;
	Story.SEENTREES=0;
	Story.LABELS=new Object();
	Story.WALK=function(SCENE, callback) {
		callback(SCENE);
		for(var N in SCENE.C) {
			if(SCENE.C[N]!==Story) {
				Story.WALK(SCENE.C[N], callback);
				}
			}
		if(SCENE.T&&SCENE.T.C) {
			for(N in SCENE.T.C) {
				Story.WALK(SCENE.T.C[N], callback);
				}
			}
		}
	Story.WALK(Story, function(SCENE) {
		if(SCENE.E!==false) {
			Story.PATHS++;
			SCENE.ID=Story.PATHS-1;
			}
		else {
			SCENE.ID=-1;
			}
		if(SCENE.L) {
			Story.LABELS[SCENE.L]=SCENE;
			}
		if(SCENE.C) {
			for(var N in SCENE.C) {
				if(typeof SCENE.C[N]==="object") {
					continue;
					}
				else if(typeof SCENE.C[N]==="string") {
					SCENE.C[N]=Story.LABELS[SCENE.C[N]]||{
						E: false,
						P: "[ERROR] no scene labeled '"+SCENE.C[N]+"'",
						C: Story.RETURN
						}
					continue;
					}
				SCENE.C[N]=Story.NOSCENE;
				}
			}
		else {
			SCENE.C=Story.RETURN;
			}
		if(SCENE.T) {
			Story.TREES++;
			}
		});
	if(Story.C["About"]) {
		if(Story.C["About"].C===Story.RETURN) {
			Story.C["About"].C={
				"Return to Start": Story
				}
			}
		Story.C["About"].C["Spec. Information"]={
			E: false,
			P: "Title: "+Story.M.Title
				+"\nAuthor: "+Story.M.Author
				+"\n"
				+"\n[CONFIG]"
				+"\nTheme: "+config.theme+".css"
				+"\nFile: "+config.file+".json"
				+"\n"
				+"\n[FILE]"
				+"\nRevision: "+Story.M.Revision.toFixed(2)
				+"\nSize: "+(request.responseText.length/1024).toFixed(2)+" KB"
				+" ("+Story.PATHS+" scenes)"
				+"\n"
				+"\n[ENGINE]"
				+"\nVersion: "+VERSION.toFixed(2)
				+"\nAuthor: Fay Fooksie"
				+"\nLanguage: HTML/JavaScript",
			C: Story.RETURN
			}
		}

	//setup DATA
	Data={
		FLAG: new Object(),
		SEEN: new Array(Story.PATHS)
		}

	//setup SCENE
	Scene={
		C: {
			init: Story
			}
		}

	//reference elements
	var	prompt=document.getElementById("prompt"),
		options=document.getElementById("options"),
		status={
			new: document.getElementById("status-new"),
			trees: document.getElementById("status-trees"),
			completion: document.getElementById("status-completion")
			}

	//handle actions
	options.addEventListener("do", function(event) {
		Scene=Scene.C[event.detail];

		//update scene (if exists)
		if(Scene.E!==false) {

			//update progress
			if(Data.SEEN[Scene.ID]) {
				status.new.textContent="";
				}
			else {
				Story.SEEN++;
				Data.SEEN[Scene.ID]=true;
				status.new.textContent="* NEW *";
				status.completion.textContent="Completion: "+Math.round(Story.SEEN/Story.PATHS*100)+"%";
				}

			//update flagstate
			if(Scene.T&&Data.FLAG[Scene.T.R]) {
				Scene.P+="\n\n"+Scene.T.P;
				for(var choice in Scene.T.C) {
					Scene.C[choice]=Scene.T.C[choice];
					}
				Scene.T=Scene.T.T;
				Story.SEENTREES++;
				status.new.textContent="* NEW *";
				status.trees.textContent="Trees: "+Story.SEENTREES+"/"+Story.TREES;
				}
			if(Scene.F) {
				Data.FLAG[Scene.F]=true;
				}
			}
		else {
			status.new.textContent="";
			}

		//write prompt
		prompt.textContent=Scene.P;

		//make options
		while(this.firstChild) {
			this.removeChild(this.firstChild);
			}
		var	div=null,
			index=-1;
		for(var choice in Scene.C) {
			index++;
			div=document.createElement("div");
			div.dataset.id=index;
			div.textContent=choice;
			this.appendChild(div);
			}
		this.dataset.selected=0;
		this.firstChild.className="selected";
		});

	//begin
	options.dispatchEvent(
		new CustomEvent("do", {
			detail: "init"
			})
		);
	})();