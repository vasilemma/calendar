function scroll(){
	var scroller = document.getElementById('scroller');
	var scrollbar = document.getElementById('scrollbar');
	var object = document.getElementById('search_box_field');
	var searchBlock = document.getElementById('search_box');

	var searchBlockHeight = searchBlock.offsetHeight;	//Высота видимой части объекта прокрутки
	var scrollbarHeight = scrollbar.offsetHeight; 		//Высота полосы прокрутки
	var objectTrackHeight = object.offsetHeight; 		//Высота объекта прокрутки целиком
	var scrollerHeight = Math.round((searchBlockHeight*scrollbarHeight)/objectTrackHeight);	//Высота ползунка

	if(scrollerHeight >= scrollbarHeight){
		//Обнуляем обработчик события
		if(document.getElementById('search_box').addEventListener){
			document.getElementById('search_box').addEventListener('DOMMouseScroll', function(){return false;}, false);
		}
		document.getElementById('search_box').onmousewheel = function(){return false;};
		return false;
	}
	scroller.style.height = scrollerHeight + "px";		//Устанавливаем высоту ползунка

	//На каждый пиксель сдвига бегунка мы будем сдвигать список результатов поиска на величину delta
	var delta = objectTrackHeight / scrollbarHeight;
	//Отступ ползунка по умолчанию
	var scrollerDefaultLeft = parseInt(scroller.style.top);

	//Захватить
	scroller.onmousedown = drag;
	//Перетащить
	window.onmousemove = move;
	//Отпустить
	window.onmouseup = drop;

	var canDrag = false;

	//начальный сдвиг ползунка
	var shift_x;    

	function drag(event){
		var event = event || window.event;
		canDrag = true;
		shift_x = event.clientY - parseInt(scroller.style.top);
		blockEvent(event);
		return false;
	}

	function move(event){
		var event = event || window.event;
		if(canDrag){
			setPosition(event.clientY - shift_x);
			blockEvent(event);
		}
		return false;
	}

	function drop(){
		//Освобождаем ползунок
		canDrag = false; 
	}

	function setPosition(newPosition){
		//Проверим не выйдет ли наш ползунок за границы полосы прокрутки
		if((newPosition <= scrollbarHeight - scrollerHeight + scrollerDefaultLeft) && (newPosition >= scrollerDefaultLeft)){
			scroller.style.top = newPosition + "px";
		}else if (newPosition > scrollbarHeight - scrollerHeight){    
			scroller.style.top = scrollbarHeight - scrollerHeight + scrollerDefaultLeft + "px";
		}else{
			scroller.style.top = scrollerDefaultLeft + "px";
		}
		//передвинем меню:
		object.style.marginTop = Math.round((parseInt(scroller.style.top)-scrollerDefaultLeft)*delta*(-1)) + "px";
		return false;
	}

	//Эта функция предотвращает «высплытие» события наружу
	function blockEvent(event){
		var event = event || window.event;
		if(event.stopPropagation){
			event.stopPropagation();
		}else{
			event.cancelBubble = true;
		}
		if(event.preventDefault){
			event.preventDefault();
		}else{
			event.returnValue = false;
		}
	}

	if(document.getElementById('search_box').addEventListener){
		document.getElementById('search_box').addEventListener('DOMMouseScroll', wheel, false);
	}
	document.getElementById('search_box').onmousewheel = wheel;

	function wheel(event){
		//сдвиг
		var wheelDelta = 0;
		
		//Шаг меню при прокрутке
		var step = Math.round(object.getElementsByClassName('finded_event')['0'].offsetHeight * scrollbarHeight / objectTrackHeight);
		var event = event || window.event;
		if(event.wheelDelta){
			wheelDelta = event.wheelDelta/120;
			if (window.opera){
				wheelDelta = event.wheelDelta/40;
			}
		}else if(event.detail){
			wheelDelta = -event.detail;
		}
		if(wheelDelta){
			var currentPosition = parseInt(scroller.style.top);               
			var newPosition = (-1)*wheelDelta*step + currentPosition;
			setPosition(newPosition); 
		}
		
		// Убиваем событие (чтобы страница не скроллилась)
		if(event.preventDefault){
			event.preventDefault();
		}
		event.returnValue = false;
		blockEvent(event);
	}
	return true;
}