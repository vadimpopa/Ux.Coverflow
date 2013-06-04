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
