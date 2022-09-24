// Asyncify-ing a function does not improve the overall performance - it makes it little worse -
// but it allows the js runtime to take breaks to handle other tasks between calls.
export default function asyncify<T extends Function>(f: T) {
	return async (...args: T['arguments']) => await f([...args]);
}
