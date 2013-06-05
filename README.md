Ux.Coverflow
============

Infinite, buffered, circular(cylinder) Coverflow in Sencha Touch 2.2.

Work in progress. No license, you are free to use it. If it helped you, just star it.

Demo: https://rawgithub.com/vadimpopa/Ux.Coverflow/master/index.html

Features:

1. Infinite:
	There aren't any limits in dragging, starts from beginning if all were shown.

2. Buffering:
	Buffering is eanbled if total number of items to show is greater than the specified carousel size(config). Only one item at time is buffered, this happens when the index of the up front item is changed while dragging.

3. Different carousel sizes / different views:
	- 1, 2 items: flat display at center.
	- 3 items: coverflow mode, dragging is disabled.
	- More than 3:
		- exandAdjacent(true): after drag, previous and next items are expanded to show more to user. Expand is allowed only if the screen width is enough to fit the coverflow, thus previous and next items can be seen entirely.
		- exandAdjacent(false): after drag, previous and next items are not expanded, the circularity of the coverflow is preserved. Coverflow may be in this mode when there are more than 10 items to show.
  
Works on Sencha Touch 2.2.0 & 2.2.1.
Tablets only.

Some math based on: http://desandro.github.io/3dtransforms/docs/carousel.html.



