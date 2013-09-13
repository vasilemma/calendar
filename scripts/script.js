Date.prototype.daysInMonth = function() {
	"use strict";
	return 33 - new Date(this.getFullYear(), this.getMonth(), 33).getDate();
};

function changeCalendar(changeType){
	closeAllBlocks();
	//текущая дата календаря (важны только месяц и год)
	var curDate = new Date();
	if(typeof(globCurrentDate)=='undefined'){
		//установим значение для глобальной переменной
		globCurrentDate = new Date(curDate);
	} else {
		curDate = new Date(globCurrentDate);
	}
	var day = curDate.getDate();		//день текущей даты календаря (по-умолчанию тут всегда текущий день)
	var month = curDate.getMonth();		//месяц текущей даты календаря
	var year = curDate.getFullYear();	//год текущей даты календаря
	switch(changeType){
		case '+': //если нажали на кнопку направо
			fillCalendar(day, month+1, year);
			globCurrentDate = new Date(curDate.setMonth(month+1));
			break;
		case '-': //если нажали на кнопку налево
			fillCalendar(day, month-1, year);
			globCurrentDate = new Date(curDate.setMonth(month-1));
			break;
		case undefined: //если обновляем
			fillCalendar(day, month, year);
			break;
	}
}

//тут заполняем календарь
function fillCalendar(parDay, parMonth, parYear, doFindEvent, eventDay){
	//массив названий месяцев
	var monthNames = new Array ("Январь", "Февраль", "Март", "Апрель", "Май",
			"Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь");
	//массив названий дней недели
	var weekDayNames = new Array ("Понедельник", "Вторник", "Среда", 
					"Четверг", "Пятница", "Суббота", "Воскресенье");
	if(parDay==null){
		var curDate = new Date();
		parDay = curDate.getDate(); //получаем текущий день месяца
		globCurrentDate = new Date(curDate);
	}else{
		var curDate = new Date(parYear, parMonth, parDay);
	};
	//снимаем метку #today_cell у всех ячеек
	unselectTodayCell();
	var dateTitleElem = document.getElementById('dateTitle');	//элемент, в котором хранится название текущего месяца календаря
	dateTitleElem.innerHTML = monthNames[curDate.getMonth()]+' '+curDate.getFullYear();
	var curMonthDate = new Date();	//создаем объект даты
	curMonthDate.setTime(curDate.setDate(1));			//задаем его равным первому дню текущей даты календаря
	var curMonthLastDay = curDate.daysInMonth();		//используем прототип, получаем количество дней в месяце
	var week = 1;	//счетчик недель
	var day = 1;	//счетчик дней
	var weekDay = getWeekDay(curMonthDate);				//индекс дня недели первого дня месяца текущей даты календаря
	var firstDayWeekDay = weekDay;						//переменная нужна для заполнения событий на странице календаря
	var trElem = document.getElementById('1w');			//первая строка таблицы (первая неделя месяца)
	var dayText = "";
	var prevMonthDate = new Date(curDate);				//служит для заполнения данных на основании предыдущего месяца
	prevMonthDate.setMonth(curDate.getMonth()-1);		//переводим часы на месяц назад
	var prevMonthLastDay = prevMonthDate.daysInMonth();	//используем прототип, получаем количество дней в предыдущем от даты календаря месяце
	//заполняем первые ячейки первой недели днями на основе предыдущего месяца
	for(var i=1; i<weekDay; i++){
		trElem.childNodes[i].innerHTML = weekDayNames[i-1]+', '+(prevMonthLastDay-(weekDay-1)+i);
		trElem.childNodes[i].className = "no_curr_month";
	}
	//заполняем основную часть календаря
	while (day<=curMonthLastDay) {
		if(weekDay>7) {
			weekDay = 1;
			week += 1;
			if(week==6){
				var trElem = document.getElementById('5w');
			}else{
				var trElem = document.getElementById(week+'w');
			}
		};
		dayText = (week==1)?weekDayNames[weekDay-1]+', '+day:day;
		if(week==6){
			vTemp = trElem.childNodes[weekDay].innerHTML;
			trElem.childNodes[weekDay].innerHTML = vTemp+"/"+dayText;
		}else{
			trElem.childNodes[weekDay].innerHTML = dayText;
		}
		trElem.childNodes[weekDay].className = "";
		//находим текущий день
		if(parDay==day){
			var currentDate = new Date(); //текущая дата
			if(parMonth==null || (parMonth==currentDate.getMonth() && parYear==currentDate.getFullYear())){
				trElem.childNodes[weekDay].id = "today_cell";
			}
		}
		//находим текущее событие
		if(eventDay==day){
			if(doFindEvent){
				//выделяем день календаря с нужным нам событием
				setTimeout(selectTableCell, 200, trElem.childNodes[weekDay]);
			}
		}
		//инкременты
		weekDay+=1;
		day+=1;
	}
	//заполняем оставшиеся дни данными следующего месяца
	if(week!=6){
		for(var i=weekDay; i<=7; i++){
			trElem.childNodes[i].innerHTML = (i-weekDay)+1;
			trElem.childNodes[i].className = "no_curr_month";
		}
	}
	//наполним календарь событиями
	fillEvents(curDate, firstDayWeekDay, prevMonthLastDay);
}

function fillEvents(date, weekDay, prevMonthLastDay){
	if (!supportsLocalStorage()) { return false; }
	if(typeof(localStorage) !== 'undefined'){
		if(localStorage["events"]){
			var curYear = date.getFullYear();	//год текущей даты календаря
			var curMonth = date.getMonth();		//месяц текущей даты календаря
			var curMonthFirstDayWeekDay = getWeekDay(new Date(curYear, curMonth));
			var firstVisibleDayOfPrevMonth = prevMonthLastDay-curMonthFirstDayWeekDay;
			var events = JSON.parse(localStorage["events"]);
			for (var i = 0; i < events.length; i++) {
				var event = events[i];	//событие
				var eventDate = new Date(event[0]);			//дата события
				var eventDay = eventDate.getDate();
				var eventMonth = eventDate.getMonth();		//месяц даты собтия
				var eventYear = eventDate.getFullYear();	//год даты события
				if(curMonth == eventMonth && curYear == eventYear){
					//Вычислим точные координаты ячейки в таблице(номер дня недели и номер недели в месяце)
					var eventWeekDay = getWeekDay(eventDate);
					var eventWeekIndex = Math.floor((eventDay+(7-eventWeekDay))/7)+1;
					eventWeekIndex = eventWeekIndex>5?5:eventWeekIndex;
					var weekTR = document.getElementById(eventWeekIndex+"w");
					var eventTD = weekTR.childNodes[eventWeekDay];
					eventTD.className = "with_event";
					eventTD.innerHTML = eventTD.innerHTML+"</br><div class='event'><div class='event_title'>"+event[2]+"</div>"+((event[5]!="")?("<div class='event_names'>"+event[5]+"</div>"):"")+"<div style='visibility:hidden'>"+event[6]+"</div></div>";
				}else if((curMonth-1 == eventMonth && curYear == eventYear) || (eventMonth == 1 && curYear-1 == eventYear)){
					if(eventDay>=firstVisibleDayOfPrevMonth){
						//Вычислим точные координаты ячейки в таблице(номер дня недели и номер недели в месяце)
						var eventWeekDay = getWeekDay(eventDate);
						var eventWeekIndex = 1;
						var weekTR = document.getElementById(eventWeekIndex+"w");
						var eventTD = weekTR.childNodes[eventWeekDay];
						eventTD.className = "with_event";
						eventTD.innerHTML = eventTD.innerHTML+"</br><div class='event'><div class='event_title'>"+event[2]+"</div>"+((event[5]!="")?("<div class='event_names'>"+event[5]+"</div>"):"")+"<div style='visibility:hidden'>"+event[6]+"</div></div>";
					}
				}
			}
		}
	}else{
		console.log("На локальной машине localStorage работать не будет");
	}
}

function getWeekDay(date){
	var weekDay = date.getDay();
	weekDay = (weekDay==0)?7:weekDay;
	return weekDay;
}

function supportsLocalStorage() {
    return ('localStorage' in window) && window['localStorage'] !== null;
}

document.onclick = function(event){
    var event = event || window.event;
    if (!event.target) {
        event.target = event.srcElement;
    }
	//клик по ячейке
	if(event.target.localName == "td" || (event.target.offsetParent && event.target.offsetParent.localName == "td")) {
		var target = event.target.localName == "td"?event.target:event.target.offsetParent;
		selectTableCell(target);
		//скроем блок поиска и очистим строку ввода
		clearSearch();
	} else if(event.target.id=="x") {			//клик по крестику
		closeAllBlocks();
	} else if(event.target.id=="add_event_clear") {		//клик по кнопке "Удалить"
		if(deleteCurrentEvent()){
			closeAllBlocks();
			changeCalendar();
		}
	} else if(event.target.id=="add_event_done") {		//клик по кнопке "Готово"
		if(updateCurrentEvent()){
			closeAllBlocks();
			changeCalendar();
		}
	} else if(event.target.id=="add_event") {	//клик по кнопке "Добавить"
		//скроем блок поиска и очистим строку ввода
		clearSearch();
		doCreateEventBox(event.target);
	} else if(event.target.id=="add_create") {	//клик по кнопке "Создать"
		if (!supportsLocalStorage()) { return false; }
		if(typeof(localStorage) !== 'undefined'){
			var input_add = document.getElementById("input_add");
			if(input_add.value=="") {
				hideBlock("error_text", "inline");
				return false;
			}
			hideBlock("error_text");
			//создаем новое событие
			var newEvent = createNewEvent(input_add.value);
			//наполняем его и сохраняем
			if(newEvent){
				var strIndex = input_add.value.lastIndexOf(',');
				var retText = strIndex<0?"":input_add.value.substr(strIndex+1);
				retText = retText.replace(/^\s+/, "");
				newEvent[2] = retText;
				if(localStorage["events"]){
					var events = JSON.parse(localStorage["events"]);
				} else {
					var events = [];
				}
				events.push(newEvent);
				localStorage["events"] = JSON.stringify(events);
				closeAllBlocks();
				//обновляем календарь
				findEvent(newEvent);
			} else {
				hideBlock("error_text", "inline");
			}
		}else{
			alert("На локальной машине localStorage работать не будет");
		}
	} else if(event.target.id=="today") {			//клик по кнопку "Сегодня"
		//скроем блок поиска и очистим строку ввода
		clearSearch();
		closeAllBlocks();
		fillCalendar(null, null, null);
	} else if(event.target.id=="refresh") {			//клик по кнопке "Обновить"
		//скроем блок поиска и очистим строку ввода
		clearSearch();
		closeAllBlocks();
		changeCalendar();
	} else if(event.target.localName=="body") {		//клик в любом месте вне календаря
		//скроем блок поиска и очистим строку ввода
		clearSearch();
		closeAllBlocks();
	} else if(event.target.className=='finded_event' || event.target.parentNode.className=='finded_event') {	//клик по строке в результате поиска
		findEvent(event.target.parentNode.lastChild.innerHTML);
		//скроем блок поиска и очистим строку ввода
		clearSearch();
	}
	return false;
}

function deleteCurrentEvent(){
	//удаляем выбранное событие
	var selectedTD = document.getElementById('selected');
	if(selectedTD){
		var uidDIV = selectedTD.lastChild.lastChild;
		if(uidDIV){
			var uid = uidDIV.innerHTML;
			if (!supportsLocalStorage()) { return false; }
			if(typeof(localStorage) !== 'undefined'){
				var events = JSON.parse(localStorage["events"]);
				for (var i = 0; i < events.length; i++) {
					var event = events[i];
					if(event[6]===uid){
						events.splice(i,1);
						localStorage["events"] = JSON.stringify(events);
						return true;
					}
				}
			}else{
				alert("На локальной машине localStorage работать не будет");
			}
		}
	}
	return false;
}

function updateCurrentEvent(){
	//обновляем выбранное событие
	var selectedTD = document.getElementById('selected');
	if(selectedTD){
		var uidDIV = selectedTD.lastChild.lastChild;
		//Если уже существует событие на эту дату
		if(uidDIV){
			var uid = selectedTD.lastChild.lastChild.innerHTML;
			if (!supportsLocalStorage()) { return false; }
			if(typeof(localStorage) !== 'undefined'){
				var events = JSON.parse(localStorage["events"]);
				for (var i = 0; i < events.length; i++) {
					var event = events[i];
					if(event[6]===uid){
						var input_event = document.getElementById('input_event_add');
						if(inputFilled(input_event)){
							event[2] = input_event.value;
						}
						var input_name = document.getElementById('input_name_add');
						if(inputFilled(input_name)){
							event[5] = input_name.value;
						}
						var input_description = document.getElementById('input_description_add');
						if(inputFilled(input_description)){
							event[3] = input_description.value;
						}
						localStorage["events"] = JSON.stringify(events);
						return true;
					}
				}
			}else{
				alert("На локальной машине localStorage работать не будет");
				return false;
			}
		}else{
			var input_day = document.getElementById('input_day_add');
			if(inputFilled(input_day)){
				if (!supportsLocalStorage()) { return false; }
				if(typeof(localStorage) !== 'undefined'){
					var event = createNewEvent(input_day.value)
					var input_event = document.getElementById('input_event_add');
					if(inputFilled(input_event)){
						event[2] = input_event.value;
					}
					var input_name = document.getElementById('input_name_add');
					if(inputFilled(input_name)){
						event[5] = input_name.value;
					}
					var input_description = document.getElementById('input_description_add');
					if(inputFilled(input_description)){
						event[3] = input_description.value;
					}
					if(localStorage["events"]){
						var events = JSON.parse(localStorage["events"]);
					}else{
						var events = [];
					}
					events.push(event);
					localStorage["events"] = JSON.stringify(events);
					return true;
				}else{
					alert("На локальной машине localStorage работать не будет");
					return false;
				}
			}else{
				input_day.focus();
				alert('Дата не заполнена, либо заполнена в неправильном формате');
				return false;
			}
		}
	}
	return false;
}

function inputFilled(target){
	if(target.style.visibility == 'hidden' || !valueIsFilled(target.value)){
		return false;
	}
	return true;
}

function clearSearch(){
	//скроем блок поиска и очистим строку ввода
	document.getElementById("search").value = "";
	hideBlock("search_box");
}

//поиск события по тексту события
function findEvent(param){
	if (!supportsLocalStorage()) { return false; }
	if(typeof(localStorage) !== 'undefined'){
		var events = JSON.parse(localStorage["events"]);
		for (var i = 0; i < events.length; i++) {
			var event = events[i];
			if(typeof(param)=='string'){
				if(event[6]===param){
					var eventDate = new Date(event[0]);
					var year = eventDate.getFullYear();
					var month = eventDate.getMonth();
					var day = eventDate.getDate();
					var curDay = (new Date()).getDate();
					//перейдем на страницу события в календаре
					fillCalendar(curDay, month, year, true, day);
					globCurrentDate = new Date(year, month, curDay);
				}
			}else if(typeof(param)=='object'){
				if(param[6]===event[6]){
					var eventDate = new Date(param[0]);
					var year = eventDate.getFullYear();
					var month = eventDate.getMonth();
					var day = eventDate.getDate();
					var curDay = (new Date()).getDate();
					//перейдем на страницу события в календаре
					fillCalendar(curDay, month, year, true, day);
					globCurrentDate = new Date(year, month, curDay);
				}
			}
		}
	}else{
		alert("На локальной машине localStorage работать не будет");
	}
}

//функция обработки нажатия на ячейку таблицы
function selectTableCell(target, doShift){
	if(target.id == "selected" && !doShift){
		closeAllBlocks();
	}else{
		var tableOffsetLeft = target.offsetParent.offsetLeft;
		var tdOffsetLeft = target.offsetLeft;
		var tdOffsetWidth = target.offsetWidth;
		var tableOffsetTop = target.offsetParent.offsetTop;
		var tdOffsetTop = target.offsetTop;
		var tdOffsetHeight = target.offsetHeight;
		closeAllBlocks();
		target.id = "selected";
		var event_box = document.getElementById("event_box");
		event_box.style.left = tableOffsetLeft+tdOffsetLeft+tdOffsetWidth+14+"px";
		event_box.style.top = tableOffsetTop+tdOffsetTop-18+"px";
		event_box.style.display = "block";
		if(!doShift){
			fillEventBox(event_box, target.lastChild.lastChild);
		}
	}
}

//функция заполнения данных в окне события
function fillEventBox(event_box, target){
	if(target!=null){
		if (!supportsLocalStorage()) { return false; }
		if(typeof(localStorage) !== 'undefined'){
			var uid = target.innerHTML;
			var events = JSON.parse(localStorage["events"]);
			for (var i = 0; i < events.length; i++) {
				var event = events[i];
				if(event[6]===uid){
					//Тема события
					var input = document.getElementById('input_event_add');
					var block = document.getElementById('block_event_add');
					input.value = '';
					if(valueIsFilled(event[2])){
						//скрываем инпут
						input.style.visibility = 'hidden';
						//показываем текст
						block.innerHTML = event[2];
						block.style.visibility = 'visible';
					}else{
						//показываем инпут
						input.style.visibility = 'visible';
						//скрываем текст
						block.innerHTML = '';
						block.style.visibility = 'hidden';
					}
					//Дата(текст)
					var input = document.getElementById('input_day_add');
					var block = document.getElementById('block_day_add');
					input.value = '';
					if(valueIsFilled(event[4])){
						//скрываем инпут
						input.style.visibility = 'hidden';
						//показываем текст
						block.innerHTML = event[4];
						block.style.visibility = 'visible';
					}else{
						//показываем инпут
						input.style.visibility = 'visible';
						//скрываем текст
						block.innerHTML = '';
						block.style.visibility = 'hidden';
					}
					//Время(текст)
					if(valueIsFilled(event[1])){
						block.innerHTML = block.innerHTML+', '+event[1];
					}
					//Участники
					var input = document.getElementById('input_name_add');
					var block = document.getElementById('block_name_add');
					var blockTitle = document.getElementById('block_name_add_people');
					input.value = '';
					if(valueIsFilled(event[5])){
						//скрываем инпут
						input.style.visibility = 'hidden';
						//показываем текст
						block.innerHTML = event[5];
						block.style.visibility = 'visible';
						blockTitle.style.visibility = 'visible';
					}else{
						//показываем инпут
						input.style.visibility = 'visible';
						//скрываем текст
						block.innerHTML = '';
						block.style.visibility = 'hidden';
						blockTitle.style.visibility = 'hidden';
					}
					//Описание
					var input = document.getElementById('input_description_add');
					var block = document.getElementById('block_description_add');
					input.value = '';
					if(valueIsFilled(event[3])){
						//скрываем инпут
						input.style.visibility = 'hidden';
						//показываем текст
						block.innerHTML = event[3];
						block.style.visibility = 'visible';
					}else{
						//показываем инпут
						input.style.visibility = 'visible';
						//скрываем текст
						block.innerHTML = '';
						block.style.visibility = 'hidden';
					}
				}
			}
		}else{
			alert("На локальной машине localStorage работать не будет");
		}
	}else{
		//Тема события
		var input = document.getElementById('input_event_add');
		var block = document.getElementById('block_event_add');
		//показываем инпут
		input.value = '';
		input.style.visibility = 'visible';
		//очищаем текст
		block.innerHTML = '';
		block.style.visibility = 'hidden';
		
		//Дата и время(текст)
		var input = document.getElementById('input_day_add');
		var block = document.getElementById('block_day_add');
		//показываем инпут
		input.value = '';
		input.style.visibility = 'visible';
		//очищаем текст
		block.innerHTML = '';
		block.style.visibility = 'hidden';
		
		//Участники
		var input = document.getElementById('input_name_add');
		var block = document.getElementById('block_name_add');
		var blockTitle = document.getElementById('block_name_add_people');
		//показываем инпут
		input.value = '';
		input.style.visibility = 'visible';
		//очищаем текст
		block.innerHTML = '';
		block.style.visibility = 'hidden';
		blockTitle.style.visibility = 'hidden';
		//Описание
		var input = document.getElementById('input_description_add');
		var block = document.getElementById('block_description_add');
		//показываем инпут
		input.value = '';
		input.style.visibility = 'visible';
		//очищаем текст
		block.innerHTML = '';
		block.style.visibility = 'hidden';
	}
}

function valueIsFilled(value){
	if(value=='undefined' || value==null || value == "" || value == 0){
		return false;
	}else{
		return true;
	}
}

//функция обработки нажатия на кнопку "Добавить"
function doCreateEventBox(target, doShift){
	var event_box = document.getElementById("create_box");
	if(event_box.style.display == "block" && !doShift){
		closeAllBlocks();
	}else if(event_box.style.display != "block" && doShift){
		return false;
	}else{
		var buttonForm = target.offsetParent.offsetParent;
		var formOffsetLeft = buttonForm.offsetLeft;
		var formOffsetTop = buttonForm.offsetTop;
		var buttonOffsetHeight = target.offsetHeight;
		event_box.style.left = formOffsetLeft+"px";
		event_box.style.top = formOffsetTop+buttonOffsetHeight+14+"px";
		closeAllBlocks(doShift);
		event_box.style.display = "block";
	}
}

//функция обработки набора текста в поле поиска и показ списка найденных событий
function getListOfEvents(){
	if (!supportsLocalStorage()) { return false; }
	if(typeof(localStorage) !== 'undefined'){
		if(localStorage["events"]!=null){
			var search = document.getElementById("search");
			var search_box_field = document.getElementById("search_box_field");
			search_box_field.innerHTML = "";
			if(search.value != ""){
				var events = JSON.parse(localStorage["events"]);
				var search_box = document.getElementById("search_box");
				for (var i = 0; i < events.length; i++) {
					var event = events[i];
					if(event[2].toLowerCase().indexOf(search.value.toLowerCase())+1){
						search_box_field.innerHTML = search_box_field.innerHTML + "<div class='finded_event'><div class='finded_event_text'>"+event[2]+"</div>" + "<div class='finded_event_date'>"+event[4]+(valueIsFilled(event[1])?", "+event[1]:"")+"</div><div style='visibility:hidden'>"+event[6]+"</div></div>";
					}
				}
				if(search_box_field.innerHTML != ""){
					hideBlock("search_box", "block");
					var scrollbar = document.getElementById('scrollbar');
					if(!scroll()){
						scrollbar.style.visibility = 'hidden';
					}else{
						scrollbar.style.visibility = 'visible';
					}
				} else {
					hideBlock("search_box");
				}
			} else {
				//если в строке поиска пусто - скрыть список результатов
				hideBlock("search_box");
			}
		}
	}else{
		alert("На локальной машине localStorage работать не будет");
	}
}

//функция обработки нажатия на клавиши
function checkKey(event){
	event = event || window.event;
	var charCode = event.which || event.keyCode;
	//если нажали на ентер
	if(charCode==13){
		//Выберем первую запись из списка найденных событий
		var search_box = document.getElementById("search_box");
		var eventsList = search_box.getElementsByClassName("finded_event_text");
		if(eventsList.length>0) {
			//найдем событие в календаре
			findEvent(eventsList[0].innerHTML);
			//скроем блок поиска и очистим строку ввода
			document.getElementById("search").value = "";
			hideBlock("search_box");
		}
	}
}

//в тексте находим дату и время, создаем новое событие и задаем ему дату и время
function createNewEvent(text) {
	var reDate = new RegExp("(0{0,1}[1-9]|[1-2]{1}[0-9]{1}|3[0-1]{1})[ ]{1}(январь|февраль|марта|апрель|май|июнь|июль|август|сентябрь|октябрь|ноябрь|декабрь|января|февраля|март|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря){1}", "i");
	var reValue = reDate.exec(text);
	//если не нашли даты в тексте выдаем ошибку
	if(reValue == null) {
		hideBlock("error_text", "inline");
		return false;
	}
	//на основании текстового представления даты получаем объект "Дата"
	var retDate = getDateObject(reValue[0]);
	var reTime = new RegExp("(([0,1][0-9])|(2[0-3])):[0-5][0-9]")
	var retTime = reTime.exec(text);
	if(retTime != null) {
		retTime = retTime[0];
	}
	//создаем новое событие
	//					Дата в мс	 	   Время(текст)	   Тема		 Описание		Дата(текст)	  	 Участники		UID(Дата события(в мс)+Дата создания события(в мс))
	var newEvent = [retDate.getTime(),		 retTime, 		"", 		"", 		reValue[0],			"", 		String(retDate.getTime()+(new Date()).getTime())];
	return newEvent;
}

//функция обработки масштабирования
function reSize(){
	//проверяем блок около выбранной ячейки
	var selectedTD = document.getElementById("selected");
	if(selectedTD){
		selectTableCell(selectedTD, true);
	}
	//проверяем блок под кнопкой "Создать"
	var addEventButton = document.getElementById("add_event");
	doCreateEventBox(addEventButton, true);
}

function hideBlock(block, type){
	if(type){
		document.getElementById(block).style.display = type;
	} else {
		document.getElementById(block).style.display = "none";
	}
}

//функция вызывается в методе closeAllBlocks() для отмены выделения нажатой ячейки
function unselectTD(){
	var selectedTD = document.getElementById("selected");
	if(selectedTD){
		var currentDate = new Date();
		//проверяем, если это была ячейка текущего дня, то нужно ей присвоить другой ИД
		if(globCurrentDate.toDateString()==currentDate.toDateString()){
			var indexOf = selectedTD.innerHTML.indexOf("<");
			if(indexOf==(-1)){
				var day = Number(selectedTD.innerHTML);
			}else{
				var day = Number(selectedTD.innerHTML.substr(0,indexOf));
			}
			if(currentDate.getDate()==day){
				selectedTD.id = "today_cell";
			}else{
				selectedTD.id = "";
			}
		}else{
			selectedTD.id = "";
		}
	}
}

//получаем объект "Дата" по текстовому представлению
function getDateObject(value){
	var reMonth = new RegExp("(январь|февраль|марта|апрель|май|июнь|июль|августа|сентябрь|октябрь|ноябрь|декабрь|января|февраля|март|апреля|мая|июня|июля|август|сентября|октября|ноября|декабря){1}", "i");
	var reValue = reMonth.exec(value);
	var reStrMonth = reValue[0].toLowerCase();
	var month = 0;
	switch(reStrMonth){
		case 'январь':
			month = 0;
			break;
		case 'января':
			month = 0;
			break;
		case 'февраль':
			month = 1;
			break;
		case 'февраля':
			month = 1;
			break;
		case 'март':
			month = 2;
			break;
		case 'марта':
			month = 2;
			break;
		case 'апрель':
			month = 3;
			break;
		case 'апреля':
			month = 3;
			break;
		case 'май':
			month = 4;
			break;
		case 'мая':
			month = 4;
			break;
		case 'июнь':
			month = 5;
			break;
		case 'июня':
			month = 5;
			break;
		case 'июль':
			month = 6;
			break;
		case 'июля':
			month = 6;
			break;
		case 'август':
			month = 7;
			break;
		case 'августа':
			month = 7;
			break;
		case 'сентябрь':
			month = 8;
			break;
		case 'сентября':
			month = 8;
			break;
		case 'октябрь':
			month = 9;
			break;
		case 'октября':
			month = 9;
			break;
		case 'ноябрь':
			month = 10;
			break;
		case 'ноября':
			month = 10;
			break;
		case 'декабрь':
			month = 11;
			break;
		case 'декабря':
			month = 11;
			break;	
	}
	var day = Number(value.substr(0,2));
	var year = globCurrentDate.getFullYear();
	var eventDate = new Date(year, month, day);
	return eventDate;
}

//закрываем все открытые блоки
function closeAllBlocks(doShift){
	unselectTD();
	hideBlock("error_text");
	hideBlock("event_box");
	hideBlock("create_box");
	hideBlock("search_box");
	if(!doShift){
		document.getElementById("input_add").value = "";
	}
}

//функция снимает отметку #today_cell со всех ячеек
function unselectTodayCell(){
	var today_cell = document.getElementById("today_cell");
	if(today_cell){
		today_cell.id = "";
	}
}

//не даем выделять текст в документе
function preventSelection(element){
	var preventSelection = false;

	function addHandler(element, event, handler){
		if(element.attachEvent) 
		  element.attachEvent('on' + event, handler);
		else 
		  if(element.addEventListener) 
			element.addEventListener(event, handler, false);
	}
	function removeSelection(){
		if (window.getSelection) { window.getSelection().removeAllRanges(); }
		else if (document.selection && document.selection.clear)
		  document.selection.clear();
	}
	
	addHandler(element, 'mousemove', function(){
		if(preventSelection)
		  removeSelection();
	});
	addHandler(element, 'mousedown', function(event){
		var event = event || window.event;
		var sender = event.target || event.srcElement;
		preventSelection = !sender.tagName.match(/INPUT|TEXTAREA/i);
	});
}

//функция транслита
function translateFunc(){
	this.strTranslit = function(el)
	{
		new_el = document.getElementById('search');
		A = new Array();
		A["Q"]="Й";A["W"]="Ц";A["E"]="У";A["R"]="К";A["T"]="Е";A["Y"]="Н";A["U"]="Г";A["I"]="Ш";A["O"]="Щ";A["P"]="З";A["{"]="Х";A["}"]="Ъ";A["A"]="Ф";
		A["S"]="Ы";A["D"]="В";A["F"]="А";A["G"]="П";A["H"]="Р";A["J"]="О";A["K"]="Л";A["L"]="Д";A[":"]="Ж";A['"']="Э";A["|"]="/";A["Z"]="Я";A["X"]="Ч";
		A["C"]="С";A["V"]="М";A["B"]="И";A["N"]="Т";A["M"]="Ь";A["<"]="Б";A[">"]="Ю";A["?"]=",";
		A["q"]="й";A["w"]="ц";A["e"]="у";A["r"]="к";A["t"]="е";A["y"]="н";A["u"]="г";A["i"]="ш";A["o"]="щ";A["p"]="з";A["["]="х";A["]"]="ъ";A["a"]="ф";
		A["s"]="ы";A["d"]="в";A["f"]="а";A["g"]="п";A["h"]="р";A["j"]="о";A["k"]="л";A["l"]="д";A[";"]="ж";A["'"]="э";A["\\"]="\\";A["z"]="я";A["x"]="ч";
		A["c"]="с";A["v"]="м";A["b"]="и";A["n"]="т";A["m"]="ь";A[","]="б";A["."]="ю";A["/"]=".";
		A["_"]=" ";A["^"]="6";A["`"]="ё";
		new_el.value = el.value.replace(/([\u0041-\u007A])/g,
			function (str,p1,offset,s) {
				if (A[str] != 'undefined'){return A[str];}
			}
		);
	}
	/* Normalizes a string, eю => eyu */
	this.strNormalize = function(el)
	{
		if (!el) { return; }
		this.strTranslit(el);
	}
}