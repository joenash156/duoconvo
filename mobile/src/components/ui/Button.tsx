import { Pressable, Text, PressableProps } from "react-native";
import React from "react";

type ButtonVariant = "primary" | "secondary" | "outline";

type ButtonProps = PressableProps & {
  label: string;
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary active:bg-primary-dark",
  secondary: "bg-secondary active:bg-secondary-dark",
  outline: "bg-transparent border-2 border-primary active:bg-primary/10",
};

const labelVariantClasses: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-white",
  outline: "text-primary",
};

export function Button({ label, variant = "primary", className, ...pressableProps }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`min-h-14 items-center justify-center rounded-2xl px-6 ${variantClasses[variant]} ${className ?? ""}`}
      {...pressableProps}
    >
      <Text className={`text-base font-semibold ${labelVariantClasses[variant]}`}>{label}</Text>
    </Pressable>
  );
}
