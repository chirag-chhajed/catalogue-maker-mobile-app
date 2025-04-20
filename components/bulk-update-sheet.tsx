import { BottomSheetView } from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { View, TextInput } from "react-native";
import * as z from "zod";

import { Button } from "~/components/ui/button";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Text } from "~/components/ui/text";

const priceUpdateSchema = z.object({
  mode: z.enum(["increase", "decrease"]),
  type: z.enum(["percentage", "absolute"]),
  value: z
    .string()
    .min(1, "Value is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Must be a positive number",
    }),
});

type PriceUpdateForm = z.infer<typeof priceUpdateSchema>;

const BulkUpdateSheet = ({
  onCopyToCatalogue,
  onUpdateExisting,
}: {
  onCopyToCatalogue: (data: PriceUpdateForm) => void;
  onUpdateExisting: (data: PriceUpdateForm) => void;
}) => {
  const form = useForm<PriceUpdateForm>({
    resolver: zodResolver(priceUpdateSchema),
    defaultValues: {
      mode: "increase",
      type: "percentage",
      value: "",
    },
  });

  return (
    <BottomSheetView className="flex-1 p-4">
      <Text className="mb-4 text-2xl font-bold text-foreground">
        Update Prices
      </Text>

      <FormProvider {...form}>
        <View className="gap-4">
          <Controller
            control={form.control}
            name="mode"
            render={({ field: { value, onChange } }) => (
              <View>
                <Text className="mb-2 text-sm font-medium text-foreground">
                  Mode
                </Text>
                <RadioGroup
                  value={value}
                  onValueChange={onChange}
                  className="flex-row gap-4"
                >
                  <View className="flex-row items-center gap-2">
                    <RadioGroupItem value="increase" hitSlop={30} />
                    <Text className="text-foreground">Increase</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <RadioGroupItem value="decrease" hitSlop={30} />
                    <Text className="text-foreground">Decrease</Text>
                  </View>
                </RadioGroup>
              </View>
            )}
          />

          <Controller
            control={form.control}
            name="type"
            render={({ field: { value, onChange } }) => (
              <View>
                <Text className="mb-2 text-sm font-medium text-foreground">
                  Type
                </Text>
                <RadioGroup
                  value={value}
                  onValueChange={onChange}
                  className="flex-row gap-4"
                >
                  <View className="flex-row items-center gap-2">
                    <RadioGroupItem value="percentage" hitSlop={30} />
                    <Text className="text-foreground">Percentage</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <RadioGroupItem value="absolute" hitSlop={30} />
                    <Text className="text-foreground">Amount</Text>
                  </View>
                </RadioGroup>
              </View>
            )}
          />

          <Controller
            control={form.control}
            name="value"
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <View>
                <Text className="mb-2 text-sm font-medium text-foreground">
                  Value
                </Text>
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  className="w-full rounded-md border border-input bg-background px-4 py-2 text-foreground"
                  placeholder={`Enter ${form.watch("type") === "percentage" ? "percentage" : "amount"}`}
                />
                {error ? (
                  <Text className="mt-1 text-sm text-destructive">
                    {error.message}
                  </Text>
                ) : null}
              </View>
            )}
          />

          <View className="flex-row gap-2 pt-4">
            <Button
              onPress={form.handleSubmit(onCopyToCatalogue)}
              className="flex-1"
              disabled={form.formState.isSubmitting}
            >
              <Text className="text-center text-primary-foreground">
                Copy to new
              </Text>
            </Button>
            <Button
              onPress={form.handleSubmit(onUpdateExisting)}
              className="flex-1"
              disabled={form.formState.isSubmitting}
            >
              <Text className="text-center text-primary-foreground">
                Update existing
              </Text>
            </Button>
          </View>
        </View>
      </FormProvider>
    </BottomSheetView>
  );
};

export { BulkUpdateSheet };
