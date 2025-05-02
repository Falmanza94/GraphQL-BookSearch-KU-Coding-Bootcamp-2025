import User from '../models/User.js';
import { signToken } from '../services/auth.js';

export const resolvers = {
    Query: {
        me: async (_parent: any, _args: any, contextValue: any) => {
            const user = contextValue.user;
            if (!user) {
                throw new Error('Not authenticated');
            }

            const foundUser = await User.findById(user._id);
            return foundUser;
        },
    },

    Mutation: {
        // Login resolver
        login: async (_parent: any, { email, password }: any) => {
            const user = await User.findOne({ $or: [{ email }, { username: email }] });

            if (!user) {
                throw new Error("Cannot find this user");
            }

            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new Error('Wrong password!');
            }

            const token = signToken(user.username, user.email, user._id);
            return { token, user };
        },

        // Add User resolver
        addUser: async (_parent: any, { username, email, password }: any) => {
            const user = await User.create({ username, email, password });

            if (!user) {
                throw new Error('Something went wrong during signup!');
            }

            const token = signToken(user.username, user.email, user._id);
            return { token, user};
        },

        // Save Book resolver
        saveBook: async (_parent:any, { book}: any, contextValue: any) => {
            const user = contextValue.user;
            if (!user) {
                throw new Error('You must be logged in to save a book');
            }

            const updatedUser = await User.findOneAndUpdate(
                { _id: user._id },
                { $addToSet: { savedBooks: book } },
                { new: true, runValidators: true }
            );

            return updatedUser;
        },

        // Remove Book resolver
        removeBook: async (_parent: any, { bookId }: any, contextValue: any) => {
            const user = contextValue.user;
            if (!user) {
                throw new Error('You must be logged in to remove a book');
            }

            const updatedUser = await User.findOneAndUpdate(
                { _id: user._id},
                { $pull: { savedBooks: { bookId } } },
                { new:true }
            );

            return updatedUser;
        },
    },
};