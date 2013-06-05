Ext.define("Ux.ToggleButton",{
    extend:"Ext.Button",
    xtype:'togglebutton',
    config:{
        isPressed:false
    },
    initialize:function() {
        this.callParent( arguments );
        this.on("tap", this.onButtonPress, this);
        this.getIsPressed() ? this.addCls( this.getPressedCls() ) : this.removeCls( this.getPressedCls() );
    },
    
    onButtonPress:function() {
        this.setIsPressed( ! this.getIsPressed() );
        this.getIsPressed() ? this.addCls( this.getPressedCls() ) : this.removeCls( this.getPressedCls() );
    }
    
});

Ext.define('Cover.view.Main', {
    extend: 'Ext.tab.Panel',
    xtype: 'main',
    requires: [
        'Ext.TitleBar',
        'Ext.Video'
    ],
    config: {
        tabBarPosition: 'bottom',

        items: [
            {
                xtype : 'toolbar',
                docked: 'top',
                title: 'Ux.Coverflow',
                items: [{
                    text: 'Disable expand',
                    xtype: 'togglebutton',
                    handler: function(btn){
                        var cover = btn.up('toolbar').parent.down('coverflow');
                        if(!btn.getIsPressed()){
                            cover.setExpandedAdjacent(false);
                            cover.setPreventAdjacentExpand(true);
                        }else{
                            cover.setPreventAdjacentExpand(false);
                            cover.setExpandedAdjacent(true);
                        }
                    }
                },{
                    xtype: 'sliderfield',
                    label: 'size 7',
                    value: 7,
                    increment: 1,
                    minValue: 1,
                    maxValue: 12,
                    listeners: {
                        'change': function(me, sl, thumb, newValue) {
                            var toolbar = me.up('toolbar'),
                                toggleBtn = toolbar.down('togglebutton'),
                                cover = toolbar.parent.down('coverflow');

                            cover.setCarouselSize(newValue);
                            cover.doRefresh();
                            
                            if(toggleBtn.getIsPressed())
                                toggleBtn.onButtonPress();

                        },
                        drag : function(me, sl, thumb){
                            me.setLabel('size ' + sl.getValue()[0]);    
                        }
                    }
                }]
            },
            {
                title: 'Cover',
                xtype: 'coverflow',
                itemWidth: 380,
                itemHeight: 300,
                iconCls: 'home',
                itemCls: 'cover-item',
                itemTpl: '<img src="resources/images/img{img}.jpg"><span>{img}</span>',
                store: {
                    fields: ['img'],
                    data: [
                        {img: "0"},
                        {img: "1"},
                        {img: "2"},
                        {img: "3"},
                        {img: "4"},
                        {img: "5"},
                        {img: "6"},
                        {img: "7"},
                        {img: "8"},
                        {img: "9"},
                        {img: "10"},
                        {img: "11"},
                        {img: "12"},
                        {img: "13"}
                    ]
                } 
            }
        ]
    }
});
