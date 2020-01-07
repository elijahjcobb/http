/**
 *
 * Elijah Cobb
 *
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 *
 */

/**
 * HObject is an interface you can implement so that your entire class instance isn't sent but just certain properties
 * defined by using the bond() method.
 */
export interface HObject {
	bond(): object;
}