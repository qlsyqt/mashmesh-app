# mashmesh-app

The project is a social discovery search engine built on the basis of Lens Protocol.
* We get the data of Profile NFTs and Follow (NFTs) from Lens Protocol, and tranform them into Graph-structured data. 
* Pagerank algorithm is used to calculate the rank score of the Profiles (Handle) to perform a new type of index from the perspective of network topology. 
* We make the social graph on Lens Protocol can be explored freely with Profiles as the vertices and Follows as edges.
* The Follow feature of Lens Protocol is intergrated, which enables users make new relationships during the social discovery.

You can view detailed codes of 
1. the graph visualization engine and data capture & processing in `/src/lib/knn3/graph.js`
2. the index based on PageRank algorithm in `/src/algorithm/pagerank.py`
3. the intergration of the Follow feature in `/src/contract/useLenshubContract.js`
and use the social discovery search engine in https://social.mashmesh.knn3.xyz/

## Install dependencies

`pnpm i`

## Start App

`pnpm dev`

Please make sure your wallet is connecting polygon network, then you can start playing.

