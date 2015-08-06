(function main() {
	$(document).ready(function() {
		var menu_jq = $("#div_header #div_header_menu");
		var headerText_jq = $("#div_header #div_header_text");
		var sidebar_jq = $("#div_sidebar");
		var menuPlaceholder_jq = menu_jq.clone();
		var tempHeaderHolder;
		
		var scrolledPastMenu = false;
		var scrolledPastHeaderText = false;
		
		// Menu shows on scroll
		$(window).scroll(function() {
			if($(this).scrollTop() >= menu_jq.offset().top && !scrolledPastMenu) {
				// Menu becomes hidden from view
				menu_jq.addClass("stickyTop");
				menuPlaceholder_jq.insertBefore(menu_jq);
			
				scrolledPastMenu = true;
			}
			else if($(this).scrollTop() >= headerText_jq.offset().top && !scrolledPastHeaderText) {
				// Header text becomes hidden from view
				menu_jq.addClass("dropShadow")
					.children("span").text(headerText_jq.text());
					
				tempHeaderHolder = headerText_jq.html();
				headerText_jq.html("<h1>&nbsp;</h1>");
				
				scrolledPastHeaderText = true;
			}
			else if($(this).scrollTop() < headerText_jq.offset().top && scrolledPastHeaderText) {
				// Header text becomes visible from view
				menu_jq.removeClass("dropShadow")
					.children("span").text("");
				headerText_jq.html(tempHeaderHolder);
				
				scrolledPastHeaderText = false;
			}
			else if($(this).scrollTop() < menu_jq.offset().top && scrolledPastMenu) {
				// Menu becomes visible from view
				menu_jq.removeClass("stickyTop");
				menuPlaceholder_jq.remove();
			
				scrolledPastMenu = false;
			}
		});
		
		// Menu icon
		menu_jq.children("#img_menu").click(function(eObj) {
			eObj.stopImmediatePropagation();
		
			$(document.body).addClass("hiddenScroll menuOverlay");
			sidebar_jq.animate({
				"left": "0"
			}, 250);
		});
		
		// Hide sidebar
		$(document.body).click(function() {
			var body_jq = $(this);
		
			if(body_jq.hasClass("menuOverlay")) {
				sidebar_jq.animate({
					"left": -sidebar_jq.width()
				}, 250, function() {
					body_jq.removeClass("hiddenScroll menuOverlay");
					sidebar_jq.find("dt").removeClass("mainNavSelect");
				});
			}
		});
		
		// Do not hide sidebar unless a link was clicked
		sidebar_jq.click(function(eObj) {
			if(!$(eObj.target).is("a")) {
				// Don't retract sidebar if we clicked not a link
				eObj.stopImmediatePropagation();
				
				if($(eObj.target).is("dt")) {
					// Top menu. Show/hide subcategories
					$(eObj.target).next().slideToggle(250);
					$(eObj.target).siblings("dt").removeClass("mainNavSelect");
					$(eObj.target).addClass("mainNavSelect");
				}
			}
			else {
				// A link was clicked!
				var div_jq = $($(eObj.target).attr("href"));
				eObj.preventDefault();
				
				$("#div_content")
					.children().not(div_jq)
					.hide();
				div_jq.fadeIn(250);
				
				// Check if link points to one of the OJ divs
				if(div_jq.index() >= 0 && div_jq.index() <= 2) {
					div_jq.children("table").hide();
					
					// A chain of promises. Wee!
					// Show loader when loading. Show table when done.
					Q.when($("#div_content #div_content_loader").fadeIn(250))
						.then(function() {
							// Get ranklist 
							return Q.all([getRanklistDeferred(div_jq.index()), getSchoolData()]);
						})
						.spread(function(rankInfos, schoolData) {
							// Print ranklist to table
							var aTBody_jq = div_jq.children("table").children("tbody");
							aTBody_jq.empty();
							
							return printToTable(rankInfos, schoolData, div_jq.index(), aTBody_jq);
						})
						.then(function() {
							// Remove loader
							$("#div_content #div_content_loader").fadeOut(250);
						})
						.then(function() {
							// Show table
							div_jq.children("table").fadeIn(250);
						});
				}
				
				// Emphasize link
				sidebar_jq.find("a").removeClass("activePageLink");
				$(eObj.target).addClass("activePageLink");
			}
		});
		
		// Tablesorter
		// $("table").tablesorter();
	});
}) ();