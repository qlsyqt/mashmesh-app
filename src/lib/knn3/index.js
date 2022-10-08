import { gql, GraphQLClient } from "graphql-request";
import graph from "./graph";
import config from "../../config";

const client = new GraphQLClient(config.knn3Endpoint);

const getENS = async (val) => {
  const query = gql`
  {
    ens(where:{ens:"${val}"}, options: {limit:5}){
      ens,
      address,
    }
  }
`;

  return (await client.request({ document: query })).ens;
};

const getLens = async (val) => {
  const query = gql`
    {
      lens(where:{handle: "${val}"}, options: { limit: 5 }){
        handle,
        profileId,
        imageURI,
        value,
        creator,
        followModule,
      }
    }
  `;

  return (await client.request({ document: query })).lens;
};

const getAddress = async (address) => {
  const query = gql`
    {
      addrs(where:{address: "${address}"}){
        address,
        name,
        ens,
        lensInclude{
          handle
        }
        holdNfts(options:{limit: 50}) {
          name,
          contract,
          imageUrl
        }
      }
    }
  `;

  return (await client.request({ document: query })).addrs;
};

const searchByValue = async (value, filters) => {
  const query = gql`
    {
      ${
        filters.indexOf("address") > -1
          ? `
        addrs(where:{address_STARTS_WITH: "${value}"}, options: {limit: 5}){
          address,
          name,
          ens,
        }
      `
          : ""
      }
      ${
        filters.indexOf("domain") > -1
          ? `
        ens(where:{ens_STARTS_WITH: "${value}"}, options: {limit:5}){
          ens,
          address,
        }
      `
          : ""
      }
      ${
        filters.indexOf("lens") > -1
          ? `
      lens(where:{handle_STARTS_WITH: "${value}"}, options: { limit: 5 }){
        profileId,
        handle,
        value,
      }
    `
          : ""
      }
    }
  `;

  return await client.request({ document: query });
};

export default {
  getENS,
  getAddress,

  getLens,
  searchByValue,

  graph,
};
