const { buildSchema } = require("graphql");

module.exports=buildSchema(`

type Post {
    _id: ID!
    title: String!
    content: String!
    imageUrl: String!
    creator: User!
    createdAt: String!
    updatedAt: String!
}

type User {
    _id: ID!
    name: String!
    email: String!
    password: String!
    status: String!
    posts: [Post!]!
}

type AuthData {
    token: String!
    userId: ID!
}

type PostsData {
    posts: [Post!]!
    totalPosts: Int!
}

input UserData {
    name: String!
    email: String!
    password: String!
    
}

input PostData{
    title: String!
    imageUrl: String!
    content: String!
}
type RootQuery{
    login(email: String!, password: String!): AuthData
    getPosts(page: Int): PostsData
}

type RootMutation{
    createUser(userInput: UserData): User
    createPost(postInput: PostData): Post!
}

schema {
   mutation: RootMutation
   query: RootQuery
}
`)