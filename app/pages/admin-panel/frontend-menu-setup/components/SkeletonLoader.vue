<template>
    <div class="flex justify-center">
        <div class="w-full bg-white dark:bg-gray-800 rounded-md shadow p-5">
            <div class="w-full flex flex-wrap justify-end gap-4 mb-4">
                <div class="w-full flex flex-wrap justify-between gap-4 mb-4">
                    <div class="flex-auto">
                        <Skeleton height="40px" width="100%" borderRadius="8px" class="min-w-[200px]" />
                    </div>
                    <div class="flex items-center">
                        <Skeleton width="6rem" height="2rem" borderRadius="10px"></Skeleton>
                    </div>
                </div>

            </div>
            <form>
                <ul v-for="(index) in 2" :key="index" class="dragArea child" handle=".section_drag_cross"
                    group="[object Object]">
                    <li class="child">
                        <div
                            class="flex items-center gap-2 bg-white dark:bg-gray-800 input_block border dark:border-gray-300">
                            <Skeleton class="ml-2" width="20px" height="20px" borderRadius="50%"></Skeleton>
                            <Skeleton width="100%" height="20px"></Skeleton>
                            <Skeleton width="20px" height="20px" borderRadius="50%"></Skeleton>
                            <Skeleton width="20px" height="20px" borderRadius="50%"></Skeleton>
                        </div>
                        <ul class="dragArea child" handle=".section_drag_cross" group="[object Object]">
                            <li class="">
                                <div
                                    class="flex items-center gap-2 bg-white dark:bg-gray-800 input_block border dark:border-gray-300">
                                    <Skeleton class="ml-2" width="20px" height="20px" borderRadius="50%"></Skeleton>
                                    <Skeleton width="100%" height="20px"></Skeleton>
                                    <Skeleton width="20px" height="20px" borderRadius="50%"></Skeleton>
                                    <Skeleton width="20px" height="20px" borderRadius="50%"></Skeleton>
                                </div>
                                <ul class="dragArea" handle=".section_drag_cross" group="[object Object]"></ul>
                                <div></div>
                            </li>
                        </ul>
                        <div></div>
                    </li>
                    <li class="child">
                        <div
                            class="flex items-center gap-2 bg-white dark:bg-gray-800 input_block border dark:border-gray-300">
                            <Skeleton class="ml-2" width="20px" height="20px" borderRadius="50%"></Skeleton>
                            <Skeleton width="100%" height="20px"></Skeleton>
                            <Skeleton width="20px" height="20px" borderRadius="50%"></Skeleton>
                            <Skeleton width="20px" height="20px" borderRadius="50%"></Skeleton>
                        </div>
                        <ul class="dragArea child" handle=".section_drag_cross" group="[object Object]">
                            <li class="">
                                <div
                                    class="flex items-center gap-2 bg-white dark:bg-gray-800 input_block border dark:border-gray-300">
                                    <Skeleton class="ml-2" width="20px" height="20px" borderRadius="50%"></Skeleton>
                                    <Skeleton width="100%" height="20px"></Skeleton>
                                    <Skeleton width="20px" height="20px" borderRadius="50%"></Skeleton>
                                    <Skeleton width="20px" height="20px" borderRadius="50%"></Skeleton>
                                </div>
                                <ul class="dragArea" handle=".section_drag_cross" group="[object Object]"></ul>
                                <div></div>
                            </li>
                            <li class="">
                                <div
                                    class="flex items-center gap-2 bg-white dark:bg-gray-800 input_block border dark:border-gray-300">
                                    <Skeleton class="ml-2" width="20px" height="20px" borderRadius="50%"></Skeleton>
                                    <Skeleton width="100%" height="20px"></Skeleton>
                                    <Skeleton width="20px" height="20px" borderRadius="50%"></Skeleton>
                                    <Skeleton width="20px" height="20px" borderRadius="50%"></Skeleton>
                                </div>
                                <ul class="dragArea" handle=".section_drag_cross" group="[object Object]"></ul>
                                <div></div>
                            </li>
                        </ul>
                        <div></div>
                    </li>
                    <li class="">
                        <div
                            class="flex items-center gap-2 bg-white dark:bg-gray-800 input_block border dark:border-gray-300">
                            <Skeleton class="ml-2" width="20px" height="20px" borderRadius="50%"></Skeleton>
                            <Skeleton width="100%" height="20px"></Skeleton>
                            <Skeleton width="20px" height="20px" borderRadius="50%"></Skeleton>
                            <Skeleton width="20px" height="20px" borderRadius="50%"></Skeleton>
                        </div>
                        <ul class="dragArea" handle=".section_drag_cross" group="[object Object]"></ul>
                        <div></div>
                    </li>
                </ul>
                <div class="w-full flex justify-end mt-3">
                    <Skeleton class="ml-2" width="50px" height="50px" borderRadius="50%"></Skeleton>
                </div>
            </form>
        </div>
    </div>
</template>
<style lang="scss" scoped>
$input_height: 30;

.layer_info_block {
	display: block;
	padding: 15px;

	select {
		width: 100%;
		height: 30px;
		padding: 0 10px;
		border-radius: 5px;
	}
}

li {
	position: relative;
	margin-left: 9px;

	.input_block {
		position: relative;
		height: #{$input_height}px;
		user-select: none;
		margin: 5px 0;
		padding: 0 12px 0 0;
		// border: 1px solid #ddd;
		border-radius: 25px;

		&>i {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 28px;
			height: 28px;
			font-size: 10px;

			&.rounded-full {
				border: 1px solid #999;
			}

			&.section_drag_cross {
				display: none;
				cursor: move;
			}
		}

		&:hover {
			i.section_checkbox {
				display: none;
			}

			i.section_drag_cross {
				display: flex;
			}
		}
	}

	&>ul {
		position: relative;
		padding-left: 24px;

		&>li {
			&::after {
				position: absolute;
				content: "";
				width: 20px;
				height: 5px;
				border-bottom: 1px solid #999;
				// border-left: 1px solid #999;
				// border-radius: 0 0 0 5px;
				left: -18.8px;
				top: 12px;
			}
		}

		&.child {
			&::before {
				content: "";
				position: absolute;
				left: 14px;
				top: -5px;
				width: 1px;
				height: calc(100% + 10px);
				border-left: 1px solid #999;
			}
		}
	}
}

/* Smooth expand transition */
.expand-enter-active,
.expand-leave-active {
	transition: max-height 0.4s ease-in-out, opacity 0.3s ease-in-out;
	overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
	max-height: 0;
	opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
	max-height: 500px;
	opacity: 1;
}
</style>