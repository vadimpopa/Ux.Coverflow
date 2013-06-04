Ext.define('Ux.Coverflow',{
    extend: 'Ext.Container',

    xtype: 'coverflow',

    config:{
    
        /**
         * @cfg {String} itemCls
         * A css class name to be added to each item element.
         */
        itemCls: '',
        
        /**
         * @cfg {Boolean} preventOrientationChange
         * Prevent attaching refresh method to orientation change event on Ext.Viewport
         */
        preventOrientationChange: false,

        store: null,

        /**
         * @private
         */
        styleHtmlCls: "ux-cover-container",
        
        /**
         * @private
         */
        styleHtmlContent: true,
 
        /**
         * @private
         */
        baseCls: 'ux-cover',

        /**
         * @private
         */
        itemBaseCls: 'ux-cover-item',

        expandedAdjacent: false,

        preventAdjacentExpand: false,

        itemWidth: 380,

        itemHeight: 300,

        itemTpl: null,

        /**
         * @cfg {String} loadingText
         * A string to display during data load operations.  If specified, this text will be
         * displayed in a loading div and the view's contents will be cleared while loading, otherwise the view's
         * contents will continue to display normally until the new data is loaded and the contents are replaced.
         */
        loadingText: 'Loading...'
    },
    /**
     * @private
     * 
     */
    decreaseFactor: Ext.os.is('iOS') ? 0.1 : 0.2,

    /**
     * @private
     */
    rotation: 0,

    /**
     * @private
     */
    lastFrontIdx: 0,

    /**
     * @private
     */
    carouselSize: 7,

    /**
     * @private
     */
    storeEventHooks: {
        beforeload: 'onBeforeLoad',
        load: 'onLoad'
    },
    //override
    initialize: function(){
        var me = this;

        me.callParent();

        if(!me.getPreventOrientationChange()){
            //subscribe to orientation change on viewport
            Ext.Viewport.on('orientationchange', me.onOrientationChange, me);
        }

        me.getInnerHtmlElement().setVisibilityMode(this.element.VISIBILITY).setVisible(false);

        me.readIdx =  Math.round(me.carouselSize/2)-1;

        if (me.getStore()) {
            if (me.isPainted()) {
                me.doRefresh();
            }
            else {
                me.on({
                    painted: 'doRefresh',
                    single: true
                });
            }
        }
    },
    applyStore: function(store) {
        var me = this,
            bindEvents = Ext.apply({}, me.storeEventHooks, { scope: me }),
            proxy, reader;

        if (store) {
            store = Ext.data.StoreManager.lookup(store);
            if (store && Ext.isObject(store) && store.isStore) {
                store.on(bindEvents);
                proxy = store.getProxy();
                if (proxy) {
                    reader = proxy.getReader();
                    if (reader) {
                        reader.on('exception', 'handleException', this);
                    }
                }
            }
        }
        return store;
    },
    applyExpandedAdjacent: function(expanded){
        var me = this,
            oldExpandedAdjacent = me._expandedAdjacent;

        if(!me.getPreventAdjacentExpand()){
            if(me.element.getWidth() < me.minVisibleWidth){
                return false;
            } 
            return expanded === false ? expanded : true;
        }

        // if is default value return it
        if(!Ext.isDefined(oldExpandedAdjacent)){
            return expanded;
        }
    },
    updateExpandedAdjacent: function(expanded) {
        if(this.isPainted())
            expanded ? this.expandAdjacent() :  this.collapseAdjacent();
    },

    updateStore: function(newStore, oldStore) {
        var me = this,
            bindEvents = Ext.apply({}, me.storeEventHooks, { scope: me }),
            proxy, reader;

        if (oldStore && Ext.isObject(oldStore) && oldStore.isStore) {
            oldStore.un(bindEvents);

            if (!me.isDestroyed) {
                me.onStoreClear();
            }

            if (oldStore.getAutoDestroy()) {
                oldStore.destroy();
            }
            else {
                proxy = oldStore.getProxy();
                if (proxy) {
                    reader = proxy.getReader();
                    if (reader) {
                        reader.un('exception', 'handleException', this);
                    }
                }
            }
        }

        if (newStore) {
            if (newStore.isLoaded()) {
                me.hasLoadedStore = true;
            }

            if (newStore.isLoading()) {
                me.onBeforeLoad();
            }
            if (me.container) {
                me.refresh();
            }
        }
    },
    applyItemTpl: function(config){
        if(Ext.isArray(config)){
            config = config.join("");
        }
        return new Ext.XTemplate(config);
    },
    updateItemTpl: function(newTpl){
        this.setTpl(new Ext.XTemplate('<tpl for="."><div data-idx="{storeIdx}" class="' + this.getItemBaseCls() + ' ' + this.getItemCls() + '">'+newTpl.html+'</div></tpl>'));
    },
    getInnerHtmlElement: function(){
        var el = this.innerHtmlElement;

        if(!el){
            el = this.callParent();

            el.on({
                singletap: 'onItemSingleTap',
                delegate: '.ux-cover-item',
                scope: this
            });

            el.setSize(this.getItemWidth(),this.getItemHeight());
        }
        return el;
    },
    onBeforeLoad: function() {
        var loadingText = this.getLoadingText(),
            items = this.getViewItems();

        if (loadingText && this.isPainted()) {
            this.setMasked({
                xtype: 'loadmask',
                message: loadingText
            });
        }

        if(items.length > 0){
            this.innerHtmlElement.destroy();
        }

        //this.hideEmptyText();
    },
    onLoad: function(store,records){
        this.doRefresh();
        this.setMasked(false);
    },  
    onDragStart: function(e){
        this.innerHtmlElement.setStyle({
            "-webkit-transition-duration" : "0s",
            "transition-duration" : "0s",
            "-webkit-timing-function": " ",
        });

        this.setExpandedAdjacent(false);
    },
    onDrag: function(e){
        var delta = Math.round(e.deltaX*this.decreaseFactor),
            angle = this.rotation + delta,
            dir = e.direction.x,
            idx;

        //this.innerHtmlElement.setVisible(false);

        this.innerHtmlElement.setStyle({webkitTransform: 'translateZ(-' + this.radius + 'px) ' + 'rotateY(' +  angle + 'deg)'});

        idx = this.checkFrontIdx(Math.round(angle/this.theta));
        if(this.needsBuffering){
            if(idx != this.lastFrontIdx && dir !== 0) {
                this.bufferItem(idx,dir);
                this.lastFrontIdx = idx;
            }
        }
       // this.innerHtmlElement.setVisible(true);
    },
    onDragEnd: function(e){
        var me = this,
            items = me.getViewItems(),
            dir = e.direction.x,
            idx;
            //velocity = e.absDeltaX/(e.time-e.startTime),

        me.rotation += Math.round(e.deltaX*me.decreaseFactor);
        
        idx = Math.round(me.rotation/me.theta);
        this.rotation =  idx * this.theta;


       this.innerHtmlElement.setStyle({
            "-webkit-transition-duration" : "0.4s",
            "transition-duration" : "0.4s",
            "-webkit-timing-function": "ease-out",
            webkitTransform: 'translateZ(-' + this.radius + 'px) ' + 'rotateY(' +  this.rotation + 'deg)'
        });

        idx = me.checkFrontIdx(idx);
        me.lastFrontIdx = idx;

        this.setExpandedAdjacent(true);
    },
    onItemSingleTap: function(e) {
        var me = this,
            target = e.getTarget(),
            index = target.getAttribute("data-idx"),
            record = this.getStore().getAt(index);

        me.fireEvent('itemsingletap', me, index, Ext.get(target), record);
    },
    onStoreClear: function() {
        var items = this.getViewItems(),
            i = 0,
            l = items.length;

        for (; i < l; i++) {
            Ext.get(items[i]).destroy();
        }

        //Clear also drag listeners because there may be the case that won't be needed, see doRefresh.
        this.element.clearListeners();
    },
    onOrientationChange: function(){
        if(this.isPainted());
            this.setExpandedAdjacent();
    },
    doRefresh: function() {
        //this.onStoreClear();

        var me = this,
            i=0,
            carouselSize = me.carouselSize,
            records = this.getStore().getRange(),
            totalCount = records.length,
            innerHtmlElement = this.getInnerHtmlElement(),
            data=[],
            l;


        // Adjust coverflow to server response.
        if(totalCount > 0){
            if(me.carouselSize > totalCount)
                me.carouselSize = totalCount;
            else{
                if(me.carouselSize > 10)
                    me.setExpandAdjacent(false);
            }
            
            function pushData(rec){
                var recData = rec.getData(true);
                recData.storeIdx = i;
                data.push(recData);
            }

            if(totalCount >= 3) {

                l = me.readIdx;

                for(;i <= l; i++){
                    pushData(records[i]);
                }

                l = totalCount;
                i = totalCount - (me.carouselSize - data.length);

                for(; i < l; i++){
                    pushData(records[i]);                
                }                
                
                me.needsBuffering = totalCount > this.carouselSize ? true : false;

                //Append drag listeners to the root element to have more space for dragging
                me.element.on({
                    drag: 'onDrag',
                    dragstart: 'onDragStart',
                    dragend: 'onDragEnd',
                    scope: me
                });

            }else{
                for(; i < carouselSize; i++){
                    pushData(records[i]);
                }
            }

            me.setData(data); 
            me.doInitialTransform();

            // Wait until element is ready
            setTimeout(function(){
                innerHtmlElement.setVisible(true);
            },500);
        }
    },
    /**
     * Method called when the Store's Reader throws an exception
     * @method handleException
     */
    handleException: function() {
        this.setMasked(false);
    },
    checkFrontIdx: function(idx){
        idx = idx%this.carouselSize;

        if(idx > 0){
            idx = this.carouselSize - idx;
        }else{
            idx = Math.abs(idx);
        }
        return idx;
    },
    getViewItems: function() {
        return Array.prototype.slice.call(this.innerHtmlElement.dom.childNodes);
    },
    doInitialTransform: function(){
        var me = this,
            items = me.getViewItems(),
            itemWidth = me.getItemWidth(),
            length = items.length,
            radiansCoef = Math.PI/180,
            angle,i=0,x;


            if(items.length >= 3){
                me.theta = 360 / length;
                me.radius = Math.round( ( 400 / 2) / Math.tan( Math.PI / length) );

                for (; i < length; i++) {
                    angle = me.theta * i;
                    items[i].style.webkitTransform = "rotateY(" + angle + 'deg) translateZ(' + me.radius + 'px)';
                }

                if(me.rotation !== 0){
                    me.lastFrontIdx = Math.round( me.rotation / me.theta );
                    me.rotation = me.lastFrontIdx * me.theta;
                }

                me.innerHtmlElement.setStyle({webkitTransform: 'translateZ(-' + me.radius + 'px) ' + 'rotateY(' + me.rotation + 'deg)'})

                // Can we start with previous and next items expanded ?
                if(! me.getPreventAdjacentExpand()){
                    angle = me.theta*0.3;

                    var c = Math.sin(angle*radiansCoef)*itemWidth/2,
                        ip = Math.cos((180-angle)/2*radiansCoef)*2*me.radius;

                    me.expandX = itemWidth - Math.sqrt(ip*ip-c*c) + 5;

                    me.minVisibleWidth = me.expandX*2 + itemWidth;

                    me.setExpandedAdjacent(true);
                }

            }else
            if(length === 2){
                // Calculate position based on itemWidth and some spacing of 5 px between them.
                x = itemWidth/2 + 5;
                items[0].style.webkitTransform = "translateX(-"+x+"px)";
                items[1].style.webkitTransform = "translateX("+x+"px)";
            }
    },
    bufferItem: function(idx,direction) {
        var me = this,
            store = me.getStore(),
            totalCount =  store.getCount(),
            readIdx = me.readIdx,
            lastItemIdx = me.carouselSize-1,
            item,record,updateIdx;

        if(direction === 1){
            if(!Ext.isDefined(me.updateIdx)){
                me.updateIdx = readIdx;   
            }

            updateIdx = me.updateIdx;

            // Move update index only when is the same direction
            if(direction === this.lastDirection) 
                updateIdx--;

            if(updateIdx < 0)
                updateIdx = lastItemIdx;
            
            readIdx--;

            // Reset tail to end of buffer
            if(readIdx < 0)
                readIdx = totalCount - 1;

            // Update before using.
            me.readIdx = readIdx;

            // Get from the end of the buffered store
            readIdx = readIdx - lastItemIdx;

            if(readIdx < 0)
                readIdx = totalCount + readIdx;

        }else{
            readIdx++;

            // Move update index only when is the same direction
            if(!Ext.isDefined(me.updateIdx)){
                me.updateIdx = readIdx; 
            }

            updateIdx = me.updateIdx;

            //Reset tail to begining of buffer
            if(readIdx === totalCount)
                readIdx = 0;

           me.readIdx = readIdx;

            if(direction === me.lastDirection) 
                updateIdx++;

            if(updateIdx > lastItemIdx)
                updateIdx = 0;
        }

        //<debug>
        console.log("item updated " + updateIdx);
        console.log("item read" + readIdx);
        //</debug>

        record = store.getAt(readIdx);
        item = me.getViewItems()[updateIdx];

        var data = record.getData(true);

        data.xcount = me.carouselSize;
        data.index = updateIdx;
        data.storeIdx = readIdx;

        //item.innerHTML = new Ext.XTemplate(me.createItemTpl()).apply();
        item.innerHTML = me.getItemTpl().apply(data);

        item.setAttribute("data-idx",readIdx);

        me.updateIdx = updateIdx;
        me.lastDirection = direction;
    },
    destroy: function() {
        var store = this.getStore(),
            proxy = (store && store.getProxy()),
            reader = (proxy && proxy.getReader());

        if (reader) {
            reader.clearListeners();
        }

        this.element.clearListeners();

        Ext.Viewport.un('orientationchange', me.onOrientationChange, me);

        this.callParent(arguments);

        this.setStore(null);
    },
    collapseAdjacent: function(){
        var me = this,
            next,prev,items,
            lastFrontIdx = me.lastFrontIdx;

        if(lastFrontIdx !== undefined){
            items = me.getViewItems(),
            l = items.length;

            if(lastFrontIdx === 0){
                prev = items[l-1];
            }else
            if(lastFrontIdx === l-1) {
                next = items[0];
            }

            Ext.get(prev || items[lastFrontIdx - 1]).setStyle({
               webkitTransform: 'rotateY(' +  me.theta*(lastFrontIdx - 1) + 'deg)' + 'translateZ(' + me.radius + 'px)'
            });

            Ext.get(next || items[lastFrontIdx + 1]).setStyle({
               webkitTransform: 'rotateY(' +  me.theta*(lastFrontIdx + 1) + 'deg)' + 'translateZ(' + me.radius + 'px)'
            });
        } 
    },
    expandAdjacent: function(){
        var me = this,
            angle,next,prev,items,
            expandX,
            lastFrontIdx = me.lastFrontIdx;

        if(lastFrontIdx !== undefined){
            items = me.getViewItems(),
            l = items.length;

            if(lastFrontIdx === 0){
                prev = items[l-1];
            }else
            if(lastFrontIdx === l-1) {
                next = items[0];
            }

            angle = me.theta*(lastFrontIdx-0.3)

            Ext.get(prev || items[lastFrontIdx - 1]).setStyle({
               webkitTransform: 'rotateY(' + angle + 'deg)' + 'translateZ(' + me.radius + 'px)'+'translateX(-'+me.expandX+'px)'
            });

            angle = me.theta*(lastFrontIdx + 0.3);           

            Ext.get(next || items[lastFrontIdx + 1]).setStyle({
               webkitTransform: 'rotateY(' +  angle + 'deg)' + 'translateZ(' + me.radius + 'px)'+ 'translateX('+me.expandX+'px)'
            });
        }
    }
});