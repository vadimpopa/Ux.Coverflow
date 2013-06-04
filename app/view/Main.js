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
