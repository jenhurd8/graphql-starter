const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLID
} = require("graphql");
const axios = require("axios");

let users = require(`${__dirname}/model`);

const BASE_URL = "http://www.swapi.co";

function getFilms(url) {
  return axios.get(url).then(response => response.data);
}

const PersonType = new GraphQLObjectType({
  name: "Person",
  fields() {
    return {
      id: {
        type: GraphQLInt,
        resolve(person) {
          return person.id;
        }
      },
      name: {
        type: GraphQLString,
        resolve(person) {
          return person.name;
        }
      },
      height: {
        type: GraphQLInt,
        resolve(person) {
          return person.height;
        }
      },
      films: {
        type: new GraphQLList(MovieType),
        resolve(person) {
          return person.films[0] ? person.films.map(getFilms) : [];
        }
      },
      homeworld: {
        type: HomeWorldType,
        resolve(person) {
          return axios.get(person.homeworld).then(response => response.data);
        }
      }
    };
  }
});

const MovieType = new GraphQLObjectType({
  name: "Movie",
  fields() {
    return {
      title: {
        type: GraphQLString,
        resolve(movie) {
          return movie.title;
        }
      },
      releaseDate: {
        type: GraphQLString,
        resolve(movie) {
          return movie.release_date;
        }
      }
    };
  }
});

const HomeWorldType = new GraphQLObjectType({
  name: "HomeWorld",
  fields() {
    return {
      name: {
        type: GraphQLString,
        resolve(world) {
          return world.name;
        }
      },
      climate: {
        type: GraphQLString,
        resolve(world) {
          return world.climate;
        }
      },
      population: {
        type: GraphQLString,
        resolve(world) {
          return world.population;
        }
      }
    };
  }
});

const Query = new GraphQLObjectType({
  name: "Query",
  fields() {
    return {
      person: {
        type: PersonType,
        args: {
          id: { type: GraphQLNonNull(GraphQLInt) }
        },
        resolve(root, args) {
          return users.filter(user => user.id === args.id)[0];
        }
      },
      people: {
        type: new GraphQLList(PersonType),
        resolve(root, args) {
          return users;
        }
      }
    };
  }
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields() {
    return {
      addPerson: {
        type: new GraphQLList(PersonType),
        args: {
          id: { type: GraphQLNonNull(GraphQLInt) },
          name: { type: GraphQLString },
          height: { type: GraphQLInt },
          films: { type: new GraphQLList(GraphQLString) },
          homeworld: { type: GraphQLString }
        },
        resolve(root, args) {
          users.push({ ...args });
          return users;
        }
      },
      deletePerson: {
        type: new GraphQLList(PersonType),
        args: {
          id: { type: GraphQLNonNull(GraphQLInt) }
        },
        resolve(root, args) {
          users = users.filter(user => user.id !== args.id);
          return users;
        }
      },
      updatePerson: {
        type: PersonType,
        args: {
          id: { type: GraphQLNonNull(GraphQLInt) },
          name: { type: GraphQLString },
          height: { type: GraphQLInt },
          films: { type: new GraphQLList(GraphQLString) },
          homeworld: { type: GraphQLString }
        },
        resolve(root, args) {
          const index = users.findIndex(val => val.id === args.id);
          const filtered = users[index];
          const update = {
            ...filtered,
            name: args.name || filtered.name,
            height: args.height || filtered.height,
            films: args.films || filtered.films,
            homeworld: args.homeworld || filtered.homeworld
          };
          users[index] = update;
          return users[index];
        }
      }
    };
  }
});

module.exports = new GraphQLSchema({
  query: Query,
  mutation: Mutation
});
