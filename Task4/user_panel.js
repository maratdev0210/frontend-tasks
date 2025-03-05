const { ApolloServer, gql } = require("apollo-server");
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "goods.json");

// Читаем товары из JSON-файла
const getGoods = () => {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    const goods = JSON.parse(data);
    return goods.map((product) => ({
      ...product,
    }));
  } catch (error) {
    console.error("Ошибка чтения файла:", error);
    return [];
  }
};

// Определяем GraphQL-схему
const typeDefs = gql`
  type Product {
    id: ID!
    name: String!
    description: String
    cost: Float!
    category: String
  }

  type Query {
    products(category: String): [Product]
  }
`;

// Определяем резолверы
const resolvers = {
  Query: {
    products: (_, { category }) => {
      const goods = getGoods();
      return category
        ? goods.filter((product) => product.category === category)
        : goods;
    },
  },
};

// Создаём сервер Apollo
const server = new ApolloServer({ typeDefs, resolvers });

server.listen(3000).then(({ url }) => {
  console.log(`🚀  GraphQL сервер запущен на ${url}`);
});
