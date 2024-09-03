<script setup lang="ts">
import type { AsyncDataRequestStatus } from '#app';
import { createWeightSchema, createFatPercentageSchema } from '~/schemas/createSchemas';

const { $client } = useNuxtApp()

const state = ref({
  weight: 80,
  fatPercentage: 15
})

const isLoading = ref(false)
const mutate =  $client.weight.create.useMutation()

const mutateExample = $client.weight.create.useMutation()

const toast = useToast()
watch(mutate.status, (newValue: AsyncDataRequestStatus) =>{
  if(newValue === 'success') {
    // TODO: figure out how to change the position of a notification
    // TODO: https://ui.nuxt.com/components/notification
    toast.add({ title: 'Success', ui: { position: 'top-0 right-0' } })
  } else if (newValue === 'error'){
    // TODO: figure out how to change the position of a notification
    // TODO: https://ui.nuxt.com/components/notification
    toast.add({ title: 'Invalid input', color:'yellow',  ui: { position: 'top-0 right-0' } })
  }
})

const qeury = $client.weight.getAll.useQuery({today: true})
await qeury.execute()

async function onCreate () {
  isLoading.value = true
  await mutate.mutate(state.value)
  await qeury.execute()
  isLoading.value = false
}

const height = ref(185)
const bmi = ref<{
  low: number | null,
  mid: number | null,
  high: number | null,
  total: number | null
}>({
  low: null,
  mid: null,
  high: null,
  total: null
})

function calculateCurrentBMI(newData: { weights: { weight: number }[] }){
  if(newData?.weights && newData?.weights.length > 0){
    const weight = newData?.weights[newData?.weights.length - 1].weight
    if(height.value > 0 && weight > 0){
      const meters = height.value / 100
      const totalBMI = weight / ( meters * meters )
      bmi.value.total = Math.round(totalBMI * 10) / 10

      if(totalBMI < 18.5){
        bmi.value.low = totalBMI
        bmi.value.mid = 0
        bmi.value.high = 0
      } else if(totalBMI > 25){
        bmi.value.low = 18.5
        bmi.value.mid = 6.5
        bmi.value.high = totalBMI - 25
      } else {
        bmi.value.low = 18.5
        bmi.value.mid = totalBMI - 18.5
        bmi.value.high = 0
      }
    }
  }
}

watch(qeury.data, (newData) => {
  if(newData?.weights){
    calculateCurrentBMI(newData)
  }
})
watch(height, (newHeight, oldWeight) => {
  if(newHeight != oldWeight && qeury.data.value?.weights){
    calculateCurrentBMI(qeury.data.value)
  }
})

if(qeury.data.value?.weights){
  calculateCurrentBMI(qeury.data.value)
}

const deleteMutation = $client.weight.delete.useMutation()
// deleteMutation.mutate({})
async function onDelete() {
  deleteMutation.mutate({
    fatPercentageId: 0,
    weightId: 0
  })
}
</script>

<template>
  <div class="m-4">
    <!-- <ClientOnly> -->
      <UCard>
        <template #header>
          Weight
        </template>
          <UForm :schema="createWeightSchema" :state="state" class="space-y-4">
            <UFormGroup label="Weight" name="weight" :error="useGetError('weight', mutate.error.value?.message)">
              <UInput v-model="state.weight" type="number" />
            </UFormGroup>
            <UButton @click="onCreate" :loading="isLoading" :disabled="isLoading">
              Submit
            </UButton>
          </UForm>
      </UCard>
      <UCard>
        <template #header>
          Fat percentage
        </template>
          <UForm :schema="createFatPercentageSchema" :state="state" class="space-y-4">
            <UFormGroup label="Fat percentage" name="fatPercentage" :error="useGetError('fatPercentage', mutate.error.value?.message)">
              <UInput v-model="state.fatPercentage" type="number"/>
            </UFormGroup>
            <UButton @click="onCreate" :loading="isLoading" :disabled="isLoading">
              Submit
            </UButton>
          </UForm>
      </UCard>
      <UNotifications />
    <!-- </ClientOnly> -->
    <UCard class="my-5">
      <UFormGroup class="my-4" label="Height" name="height">
        <UInput v-model="height" type="number"/>
      </UFormGroup>
      <UMeterGroup :max="30">
        <template #indicator>
          <div class="flex gap-1.5 justify-between text-sm">
            <p>BMI</p>
            <p>
              {{ bmi.total }} current
            </p>
          </div>
        </template>
        <UMeter :value="bmi.low" color="yellow" label="Underweight" icon="i-heroicons-exclamation-triangle" />
        <UMeter :value="bmi.mid" color="green" label="Optimalweight" icon="i-heroicons-check" />
        <UMeter :value="bmi.high" color="red" label="Overweight" icon="i-heroicons-exclamation-triangle" />
      </UMeterGroup>
    </UCard>
    <div class="flex justify-around mt-5">
      <UCard class="w-[250px]">
        <template #header>
          Weight
        </template>
        <UCard
          v-for="weight in qeury.data.value?.weights"
        >
          {{ weight.weight }} KG
        </UCard>
        <UCard v-if="qeury.status.value === 'pending'">
          <USkeleton class="h-4 my-1" />
        </UCard>
      </UCard>
      <UDivider orientation="vertical" class="m-8" />
        <UCard class="w-[250px]">
          <template #header>
            Fat percentages
          </template>
        <UCard
          v-for="fatPercentage in qeury.data.value?.fatPercentages"
        >
          {{ fatPercentage.fatPercentage }}%
        </UCard>
        <UCard v-if="qeury.status.value === 'pending'">
          <USkeleton class="h-4 my-1" />
        </UCard>
      </UCard>
    </div>
  </div>
</template>
