mod math;
mod solidity;
mod string;
mod tables;
mod array;

pub use array::pack_bytes;
pub use math::{clamp, div_ceil, sqrt::sqrt};
pub use string::{field_to_hex, ord, str_to_u64, to_hex_string_bytes};

pub trait ArrayExtensions<T, let N: u32> {
    fn slice<let L: u32>(self, start: u32) -> [T; L];
    fn concat<let M: u32>(self, other: [T; M]) -> [T; N + M];
    fn pad_start<let M: u32>(self, pad_value: T) -> [T; M];
    fn pad_end<let M: u32>(self, pad_value: T) -> [T; M];
    fn enumerate(self) -> [(u32, T); N];
}
