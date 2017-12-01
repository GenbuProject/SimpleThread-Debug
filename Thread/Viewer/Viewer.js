window.addEventListener("DOMContentLoaded", () => {
	let querys = location.querySort();

	if (!querys.TID) {
		location.href = "/SimpleThread-Debug/Error/406/";
	}

	if (!base.user) {
		new DOM("#FlowPanel_Btns_CreatePost").setAttribute("Disabled", "");
	}


	
	let doc = parent.document;
		doc.querySelector("#Dialogs_Thread_InfoViewer_TID").value = querys.TID;
		doc.querySelector("#Dialogs_Thread_Poster_TID").value = querys.TID;

	base.Database.get(base.Database.ONCE, "threads/" + querys.TID, (res) => {
		doc.querySelector("#Header_Title").textContent = `${res.title}`;

		if (res.password && res.password != Encrypter.encrypt(sessionStorage.getItem("com.GenbuProject.SimpleThread.currentPassword") || "")) {
			doc.querySelector("#Dialogs_Thread_PasswordConfirmer_Link").value = location.href;

			doc.querySelector("IFrame.mdl-layout__content").src = `Thread/Viewer/Auth/?tid=${querys.TID}`;
		}
	});

	base.Database.get(base.Database.ONCE, "users", (res) => {
		for (let uid in res) document.head.appendChild(new Component.Styles.ProfilePhotoManager(uid, res[uid].gplusPhoto));
	});

	base.Database.get(base.Database.INTERVAL, "threads/" + querys.TID + "/data", (res) => {
		resForIncrease = res, resForDecrease = res;

		resForIncrease = resForIncrease.filter((post, index, parent) => {
			if (post) {
				post.pid = index;
				return true;
			}
		});

		resForDecrease.forEach((post, index, parent) => {
			post.pid = index;
		});
		
		if (new DOM("#Thread").children.length < resForIncrease.length) {
			for (let i = new DOM("#Thread").children.length; i < resForIncrease.length; i++) {
				let post = new Component.Thread.Post(resForIncrease[i].pid, resForIncrease[i].uid, "", resForIncrease[i].content, new Date(resForIncrease[i].createdAt).toLocaleString(), base.user.uid == resForIncrease[i].uid && i !== 0);
					post.querySelector('A[Data-Component="Thread_Post_Header_ActorPhoto"]').addEventListener("click", () => {
						doc.querySelector("#Dialogs_Profile_InfoViewer_UID").value = post.uid;
						doc.querySelector("#Dialogs_Profile_InfoViewer").showModal();
					});

					if (post.querySelector(`UL[Data-Component="${Component.Thread.Post.UUIDS.MENU.ROOT}"]`)) {
						setTimeout(() => {
							componentHandler.upgradeElement(post.querySelector(`UL[Data-Component="${Component.Thread.Post.UUIDS.MENU.ROOT}"]`));
						}, 100);

						post.querySelector(`Li[Data-Component="${Component.Thread.Post.UUIDS.MENU.DELETE}"]`).addEventListener("click", () => {
							base.Database.delete(`threads/${querys.TID}/data/${post.pid}/`);
						});
					}
					
				base.Database.get(base.Database.ONCE, "users/" + post.uid, (userRes) => {
					post.querySelector('Span[Data-Component="Thread_Post_Header_Actor"]').textContent = userRes.userName;
				});

				URL.filter(post.querySelector('Div[Data-Component="Thread_Post_Content"]').textContent).forEach((urlString) => {
					post.querySelector('Div[Data-Component="Thread_Post_Content"]').innerHTML = post.querySelector('Div[Data-Component="Thread_Post_Content"]').innerHTML.replace(urlString, `<A Href = "${urlString}" Target = "_blank">${urlString}</A>`);
				});

				new DOM("#Thread").appendChild(post);
			}
		} else {
			new DOM('@Div[Data-Component="Thread_Post"]').forEach((post) => {
				if (!resForDecrease[post.dataset.pid]) post.remove();
			});

			new DOM('@Div[Data-Component="Thread_Post-Mine"]').forEach((post) => {
				if (!resForDecrease[post.dataset.pid]) post.remove();
			});
		}
	});



	new DOM("#FlowPanel_Btns_CreatePost").addEventListener("click", () => {
		doc.querySelector("#Dialogs_Thread_Poster").showModal();

		new DOM("#FlowPanel_Btns_CreatePost").setAttribute("Disabled", "");
	});

	new DOM("#FlowPanel_Btns_ShowThreadInfo").addEventListener("click", () => {
		doc.querySelector("#Dialogs_Thread_InfoViewer").showModal();
	});
});