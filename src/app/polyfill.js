/*
 * babel-polyfill should be the only import here, but async iterators
 * are broken everywhere but Firefox this way.
 * So we import core-js/es7/symbol. es-core seems to work in place of
 * babel-polyfill in our case, so we can use one less package.
 */
import "core-js";
import "core-js/es7/symbol";
