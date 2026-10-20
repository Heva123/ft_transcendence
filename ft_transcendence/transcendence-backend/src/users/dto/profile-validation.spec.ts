import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { RegisterDto } from "../../auth/dto/register.dto";
import { UpdateUserDto } from "./update-user.dto";

describe("Profile validation", () => {
  it("rejects a reserved username on registration", async () => {
    const dto = plainToInstance(RegisterDto, {
      email: "hiba@example.com",
      username: "blocked",
      password: "SecurePass123",
    });
    const errors = await validate(dto);
    expect(
      errors.some(
        (error) => error.property === "username" && error.constraints?.isNotIn,
      ),
    ).toBe(true);
  });

  it("rejects renaming an account to a reserved username", async () => {
    const errors = await validate(
      plainToInstance(UpdateUserDto, { username: "blocked" }),
    );
    expect(
      errors.some(
        (error) => error.property === "username" && error.constraints?.isNotIn,
      ),
    ).toBe(true);
  });

  it("accepts an empty skill list so users can clear their skills", async () => {
    expect(
      await validate(plainToInstance(UpdateUserDto, { skills: [] })),
    ).toEqual([]);
  });

  it.each([
    { skills: Array(11).fill("React") },
    { skills: ["   "] },
    { bio: "x".repeat(301) },
  ])("rejects invalid profile input: %p", async (input) => {
    expect(
      (await validate(plainToInstance(UpdateUserDto, input))).length,
    ).toBeGreaterThan(0);
  });
});
