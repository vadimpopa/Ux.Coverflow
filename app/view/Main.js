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
                    text: 'Add item',
                    handler: function(btn){
                        var cover = btn.up('toolbar').parent.down('coverflow');
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
                            var cover = me.up('toolbar').parent.down('coverflow');
                            cover.setCarouselSize(newValue);
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
                itemTpl: '<img src="resources/images/{img}.jpg"><span>{storeIdx}</span>',
                store: {
                    fields: ['img'],
                    data: [
                        {img: "img0"},
                        {img: "img1"},
                        {img: "img2"},
                        {img: "img3"},
                        {img: "img4"},
                        {img: "img5"},
                        {img: "img6"},
                        {img: "img7"}
                    ]
                } 
            }
        ]
    }
});
