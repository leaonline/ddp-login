import { Meteor } from 'meteor/meteor'
import { storageKeys } from './utils'

/**
 * Sets the login results to the current storage implementation.
 * @param url {string} used to prefix entries and manage multiple connections
 * @param result {object}
 * @param result.token {string} the login token
 * @param result.tokenExpires {Date} the login token expiration date
 * @param result.id {string} the login user id
 */
export const setStorage = (url, result) => {
  Meteor._localStorage.setItem(storageKeys.loginToken(url), result.token)
  Meteor._localStorage.setItem(storageKeys.loginTokenExpires(url), result.tokenExpires)
  Meteor._localStorage.setItem(storageKeys.userId(url), result.id)
}

/**
 * Removed the login results from the current storage implementation.
 * @param url {string} used to prefix entries and manage multiple connections
 */
export const clearStorage = url => {
  Meteor._localStorage.removeItem(storageKeys.loginToken(url))
  Meteor._localStorage.removeItem(storageKeys.loginTokenExpires(url))
  Meteor._localStorage.removeItem(storageKeys.userId(url))
}
